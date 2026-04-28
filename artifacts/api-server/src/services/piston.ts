const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

const LANG_MAP: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
};

export type RunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

export async function runCode(
  lang: "javascript" | "python",
  code: string
): Promise<RunResult> {
  const config = LANG_MAP[lang];
  const res = await fetch(PISTON_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: config.language,
      version: config.version,
      files: [{ content: code }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Piston API error: ${res.status}`);
  }
  const data = (await res.json()) as {
    run: { stdout: string; stderr: string; code: number };
  };
  return {
    stdout: data.run.stdout,
    stderr: data.run.stderr,
    exitCode: data.run.code,
  };
}

function buildJsRunner(userCode: string, testCases: { input: string; expectedOutput: string }[]): string {
  return `
${userCode}

const __tests = ${JSON.stringify(testCases)};
const __results = [];
for (const tc of __tests) {
  try {
    const __args = JSON.parse("[" + tc.input + "]");
    const __actual = JSON.stringify(solution(...__args));
    const __expected = JSON.stringify(JSON.parse(tc.expectedOutput));
    __results.push({ passed: __actual === __expected, input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: __actual, error: null });
  } catch(e) {
    __results.push({ passed: false, input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: "", error: e.message });
  }
}
console.log(JSON.stringify(__results));
`;
}

function buildPyRunner(userCode: string, testCases: { input: string; expectedOutput: string }[]): string {
  return `
import json
import sys

${userCode}

tests = ${JSON.stringify(testCases)}
results = []
for tc in tests:
    try:
        args = json.loads("[" + tc["input"] + "]")
        actual = json.dumps(solution(*args), separators=(',', ':'))
        expected = json.dumps(json.loads(tc["expectedOutput"]), separators=(',', ':'))
        results.append({"passed": actual == expected, "input": tc["input"], "expectedOutput": tc["expectedOutput"], "actualOutput": actual, "error": None})
    except Exception as e:
        results.append({"passed": False, "input": tc["input"], "expectedOutput": tc["expectedOutput"], "actualOutput": "", "error": str(e)})
print(json.dumps(results))
`;
}

export type TestCaseResult = {
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  error: string | null;
};

export async function runTestCases(
  lang: "javascript" | "python",
  userCode: string,
  testCases: { input: string; expectedOutput: string }[]
): Promise<TestCaseResult[]> {
  const runnerCode =
    lang === "javascript"
      ? buildJsRunner(userCode, testCases)
      : buildPyRunner(userCode, testCases);

  const result = await runCode(lang, runnerCode);
  if (result.exitCode !== 0) {
    return testCases.map((tc) => ({
      passed: false,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: "",
      error: result.stderr || "Runtime error",
    }));
  }
  try {
    return JSON.parse(result.stdout.trim()) as TestCaseResult[];
  } catch {
    return testCases.map((tc) => ({
      passed: false,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: "",
      error: "Failed to parse execution output",
    }));
  }
}
