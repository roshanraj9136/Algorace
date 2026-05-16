const WANDBOX_URL = "https://wandbox.org/api/compile.json";

const COMPILERS: Record<string, string> = {
  cpp: "gcc-head",
  java: "openjdk-jdk-22+36",
};

type Signature = {
  fn: string;
  ret: string;
  params: { name: string; type: string }[];
};

export type RunResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  compileError?: string;
};

export async function runCode(lang: "cpp" | "java", code: string): Promise<RunResult> {
  const res = await fetch(WANDBOX_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, compiler: COMPILERS[lang], options: "" }),
  });

  if (!res.ok) throw new Error(`Wandbox API error: ${res.status}`);

  const data = (await res.json()) as {
    status: string;
    compiler_error: string;
    program_output: string;
    program_error: string;
  };

  if (data.compiler_error) {
    return { stdout: "", stderr: data.compiler_error, exitCode: 1, compileError: data.compiler_error };
  }

  return { stdout: data.program_output, stderr: data.program_error, exitCode: parseInt(data.status) || 0 };
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

const CPP_TYPE: Record<string, string> = {
  "int": "int", "long": "long long", "double": "double",
  "bool": "bool", "string": "string", "char": "char",
  "int[]": "vector<int>", "long[]": "vector<long long>",
  "double[]": "vector<double>", "string[]": "vector<string>",
  "bool[]": "vector<bool>", "int[][]": "vector<vector<int>>",
  "char[][]": "vector<vector<char>>", "string[][]": "vector<vector<string>>",
};

const JAVA_TYPE: Record<string, string> = {
  "int": "int", "long": "long", "double": "double",
  "bool": "boolean", "string": "String", "char": "char",
  "int[]": "int[]", "long[]": "long[]",
  "double[]": "double[]", "string[]": "String[]",
  "bool[]": "boolean[]", "int[][]": "int[][]",
  "char[][]": "char[][]", "string[][]": "String[][]",
};

function cppParam(name: string, type: string): string {
  const ct = CPP_TYPE[type] || "string";
  return type.includes("[]") ? `${ct}& ${name}` : `${ct} ${name}`;
}

function javaParam(name: string, type: string): string {
  const jt = JAVA_TYPE[type] || "String";
  return `${jt} ${name}`;
}

function cppParseCall(name: string, type: string): string {
  switch (type) {
    case "int": return `int ${name} = _pInt(raw, pos);`;
    case "long": return `long long ${name} = _pLong(raw, pos);`;
    case "double": return `double ${name} = _pDbl(raw, pos);`;
    case "bool": return `bool ${name} = _pBool(raw, pos);`;
    case "string": return `string ${name} = _pStr(raw, pos);`;
    case "int[]": return `vector<int> ${name} = _pIntArr(raw, pos);`;
    case "long[]": return `vector<long long> ${name} = _pLongArr(raw, pos);`;
    case "string[]": return `vector<string> ${name} = _pStrArr(raw, pos);`;
    case "int[][]": return `vector<vector<int>> ${name} = _pInt2D(raw, pos);`;
    case "string[][]": return `vector<vector<string>> ${name} = _pStr2D(raw, pos);`;
    default: return `string ${name} = _pStr(raw, pos);`;
  }
}

function cppSerialize(type: string, expr: string): string {
  switch (type) {
    case "int": case "long": return `to_string(${expr})`;
    case "double": return `_sDbl(${expr})`;
    case "bool": return `(${expr} ? "true" : "false")`;
    case "string": return `"\\"" + ${expr} + "\\""`;
    case "int[]": case "long[]": return `_sArr(${expr})`;
    case "double[]": return `_sDblArr(${expr})`;
    case "string[]": return `_sStrArr(${expr})`;
    case "int[][]": return `_s2D(${expr})`;
    case "string[][]": return `_sStr2D(${expr})`;
    default: return expr;
  }
}

function javaParseCall(name: string, type: string): string {
  switch (type) {
    case "int": return `int ${name} = _pInt(raw, pos);`;
    case "long": return `long ${name} = _pLong(raw, pos);`;
    case "double": return `double ${name} = _pDbl(raw, pos);`;
    case "bool": return `boolean ${name} = _pBool(raw, pos);`;
    case "string": return `String ${name} = _pStr(raw, pos);`;
    case "int[]": return `int[] ${name} = _pIntArr(raw, pos);`;
    case "long[]": return `long[] ${name} = _pLongArr(raw, pos);`;
    case "string[]": return `String[] ${name} = _pStrArr(raw, pos);`;
    case "int[][]": return `int[][] ${name} = _pInt2D(raw, pos);`;
    case "string[][]": return `String[][] ${name} = _pStr2D(raw, pos);`;
    default: return `String ${name} = _pStr(raw, pos);`;
  }
}

function javaSerialize(type: string, expr: string): string {
  switch (type) {
    case "int": case "long": return `String.valueOf(${expr})`;
    case "double": return `_sDbl(${expr})`;
    case "bool": return `String.valueOf(${expr})`;
    case "string": return `"\\"" + ${expr} + "\\""`;
    case "int[]": case "long[]": return `_sArr(${expr})`;
    case "double[]": return `_sArr(${expr})`;
    case "string[]": return `_sStrArr(${expr})`;
    case "int[][]": return `_s2D(${expr})`;
    case "string[][]": return `_sStr2D(${expr})`;
    default: return expr;
  }
}

const CPP_HELPERS = `
int _pInt(const string& s, int& p) {
    while (p < s.size() && (s[p]==' '||s[p]==',')) p++;
    int sign=1; if(p<s.size()&&s[p]=='-'){sign=-1;p++;}
    int v=0; while(p<s.size()&&isdigit(s[p])){v=v*10+s[p]-'0';p++;}
    return sign*v;
}
long long _pLong(const string& s, int& p) {
    while (p < s.size() && (s[p]==' '||s[p]==',')) p++;
    int sign=1; if(p<s.size()&&s[p]=='-'){sign=-1;p++;}
    long long v=0; while(p<s.size()&&isdigit(s[p])){v=v*10+s[p]-'0';p++;}
    return sign*v;
}
double _pDbl(const string& s, int& p) {
    while (p < s.size() && (s[p]==' '||s[p]==',')) p++;
    string t; while(p<s.size()&&(isdigit(s[p])||s[p]=='.'||s[p]=='-')){t+=s[p];p++;}
    return stod(t);
}
bool _pBool(const string& s, int& p) {
    while (p < s.size() && (s[p]==' '||s[p]==',')) p++;
    if(s.substr(p,4)=="true"){p+=4;return true;}
    p+=5; return false;
}
string _pStr(const string& s, int& p) {
    while (p < s.size() && s[p] != '"') p++;
    p++; string r;
    while (p < s.size() && s[p] != '"') { r += s[p]; p++; }
    p++; return r;
}
vector<int> _pIntArr(const string& s, int& p) {
    while (p < s.size() && s[p] != '[') p++;
    p++; vector<int> r;
    while (p < s.size() && s[p] != ']') {
        if(s[p]==','||s[p]==' '){p++;continue;}
        r.push_back(_pInt(s,p));
    }
    p++; return r;
}
vector<long long> _pLongArr(const string& s, int& p) {
    while (p < s.size() && s[p] != '[') p++;
    p++; vector<long long> r;
    while (p < s.size() && s[p] != ']') {
        if(s[p]==','||s[p]==' '){p++;continue;}
        r.push_back(_pLong(s,p));
    }
    p++; return r;
}
vector<string> _pStrArr(const string& s, int& p) {
    while (p < s.size() && s[p] != '[') p++;
    p++; vector<string> r;
    while (p < s.size() && s[p] != ']') {
        if(s[p]=='"') r.push_back(_pStr(s,p));
        else p++;
    }
    p++; return r;
}
vector<vector<int>> _pInt2D(const string& s, int& p) {
    while (p < s.size() && s[p] != '[') p++;
    p++; vector<vector<int>> r;
    while (p < s.size() && s[p] != ']') {
        if(s[p]=='[') r.push_back(_pIntArr(s,p));
        else p++;
    }
    p++; return r;
}
vector<vector<string>> _pStr2D(const string& s, int& p) {
    while (p < s.size() && s[p] != '[') p++;
    p++; vector<vector<string>> r;
    while (p < s.size() && s[p] != ']') {
        if(s[p]=='[') r.push_back(_pStrArr(s,p));
        else p++;
    }
    p++; return r;
}
template<typename T>
string _sArr(const vector<T>& v) {
    string r="[";
    for(int i=0;i<v.size();i++){if(i)r+=",";r+=to_string(v[i]);}
    return r+"]";
}
string _sStrArr(const vector<string>& v) {
    string r="[";
    for(int i=0;i<v.size();i++){if(i)r+=",";r+="\\""+v[i]+"\\\"";}
    return r+"]";
}
string _sDbl(double v) {
    ostringstream o; o << v; return o.str();
}
string _sDblArr(const vector<double>& v) {
    string r="[";
    for(int i=0;i<v.size();i++){if(i)r+=",";r+=_sDbl(v[i]);}
    return r+"]";
}
string _s2D(const vector<vector<int>>& v) {
    string r="[";
    for(int i=0;i<v.size();i++){if(i)r+=",";r+=_sArr(v[i]);}
    return r+"]";
}
string _sStr2D(const vector<vector<string>>& v) {
    string r="[";
    for(int i=0;i<v.size();i++){if(i)r+=",";r+=_sStrArr(v[i]);}
    return r+"]";
}
string _json(const string& s) {
    string r;
    for(char c : s) {
        if(c=='\\\\') r+="\\\\\\\\";
        else if(c=='\\"') r+="\\\\\\"";
        else if(c=='\\n') r+="\\\\n";
        else if(c=='\\r') r+="\\\\r";
        else if(c=='\\t') r+="\\\\t";
        else r+=c;
    }
    return r;
}
`;

const JAVA_HELPERS = `
    static int _pInt(String s, int[] p) {
        while(p[0]<s.length()&&(s.charAt(p[0])==' '||s.charAt(p[0])==','))p[0]++;
        int sign=1;if(p[0]<s.length()&&s.charAt(p[0])=='-'){sign=-1;p[0]++;}
        int v=0;while(p[0]<s.length()&&Character.isDigit(s.charAt(p[0]))){v=v*10+s.charAt(p[0])-'0';p[0]++;}
        return sign*v;
    }
    static long _pLong(String s, int[] p) {
        while(p[0]<s.length()&&(s.charAt(p[0])==' '||s.charAt(p[0])==','))p[0]++;
        int sign=1;if(p[0]<s.length()&&s.charAt(p[0])=='-'){sign=-1;p[0]++;}
        long v=0;while(p[0]<s.length()&&Character.isDigit(s.charAt(p[0]))){v=v*10+s.charAt(p[0])-'0';p[0]++;}
        return sign*v;
    }
    static double _pDbl(String s, int[] p) {
        while(p[0]<s.length()&&(s.charAt(p[0])==' '||s.charAt(p[0])==','))p[0]++;
        StringBuilder t=new StringBuilder();
        while(p[0]<s.length()&&(Character.isDigit(s.charAt(p[0]))||s.charAt(p[0])=='.'||s.charAt(p[0])=='-')){t.append(s.charAt(p[0]));p[0]++;}
        return Double.parseDouble(t.toString());
    }
    static boolean _pBool(String s, int[] p) {
        while(p[0]<s.length()&&(s.charAt(p[0])==' '||s.charAt(p[0])==','))p[0]++;
        if(s.substring(p[0]).startsWith("true")){p[0]+=4;return true;}
        p[0]+=5;return false;
    }
    static String _pStr(String s, int[] p) {
        while(p[0]<s.length()&&s.charAt(p[0])!='"')p[0]++;
        p[0]++;StringBuilder r=new StringBuilder();
        while(p[0]<s.length()&&s.charAt(p[0])!='"'){r.append(s.charAt(p[0]));p[0]++;}
        p[0]++;return r.toString();
    }
    static int[] _pIntArr(String s, int[] p) {
        while(p[0]<s.length()&&s.charAt(p[0])!='[')p[0]++;
        p[0]++;List<Integer> r=new ArrayList<>();
        while(p[0]<s.length()&&s.charAt(p[0])!=']'){
            if(s.charAt(p[0])==','||s.charAt(p[0])==' '){p[0]++;continue;}
            r.add(_pInt(s,p));
        }
        p[0]++;int[] a=new int[r.size()];for(int i=0;i<r.size();i++)a[i]=r.get(i);return a;
    }
    static long[] _pLongArr(String s, int[] p) {
        while(p[0]<s.length()&&s.charAt(p[0])!='[')p[0]++;
        p[0]++;List<Long> r=new ArrayList<>();
        while(p[0]<s.length()&&s.charAt(p[0])!=']'){
            if(s.charAt(p[0])==','||s.charAt(p[0])==' '){p[0]++;continue;}
            r.add(_pLong(s,p));
        }
        p[0]++;long[] a=new long[r.size()];for(int i=0;i<r.size();i++)a[i]=r.get(i);return a;
    }
    static String[] _pStrArr(String s, int[] p) {
        while(p[0]<s.length()&&s.charAt(p[0])!='[')p[0]++;
        p[0]++;List<String> r=new ArrayList<>();
        while(p[0]<s.length()&&s.charAt(p[0])!=']'){
            if(s.charAt(p[0])=='"')r.add(_pStr(s,p));
            else p[0]++;
        }
        p[0]++;return r.toArray(new String[0]);
    }
    static int[][] _pInt2D(String s, int[] p) {
        while(p[0]<s.length()&&s.charAt(p[0])!='[')p[0]++;
        p[0]++;List<int[]> r=new ArrayList<>();
        while(p[0]<s.length()&&s.charAt(p[0])!=']'){
            if(s.charAt(p[0])=='[')r.add(_pIntArr(s,p));
            else p[0]++;
        }
        p[0]++;return r.toArray(new int[0][]);
    }
    static String[][] _pStr2D(String s, int[] p) {
        while(p[0]<s.length()&&s.charAt(p[0])!='[')p[0]++;
        p[0]++;List<String[]> r=new ArrayList<>();
        while(p[0]<s.length()&&s.charAt(p[0])!=']'){
            if(s.charAt(p[0])=='[')r.add(_pStrArr(s,p));
            else p[0]++;
        }
        p[0]++;return r.toArray(new String[0][]);
    }
    static String _sArr(int[] a) {
        StringBuilder r=new StringBuilder("[");
        for(int i=0;i<a.length;i++){if(i>0)r.append(",");r.append(a[i]);}
        return r.append("]").toString();
    }
    static String _sArr(long[] a) {
        StringBuilder r=new StringBuilder("[");
        for(int i=0;i<a.length;i++){if(i>0)r.append(",");r.append(a[i]);}
        return r.append("]").toString();
    }
    static String _sArr(double[] a) {
        StringBuilder r=new StringBuilder("[");
        for(int i=0;i<a.length;i++){if(i>0)r.append(",");r.append(_sDbl(a[i]));}
        return r.append("]").toString();
    }
    static String _sStrArr(String[] a) {
        StringBuilder r=new StringBuilder("[");
        for(int i=0;i<a.length;i++){if(i>0)r.append(",");r.append("\\"").append(a[i]).append("\\"");}
        return r.append("]").toString();
    }
    static String _s2D(int[][] a) {
        StringBuilder r=new StringBuilder("[");
        for(int i=0;i<a.length;i++){if(i>0)r.append(",");r.append(_sArr(a[i]));}
        return r.append("]").toString();
    }
    static String _sStr2D(String[][] a) {
        StringBuilder r=new StringBuilder("[");
        for(int i=0;i<a.length;i++){if(i>0)r.append(",");r.append(_sStrArr(a[i]));}
        return r.append("]").toString();
    }
    static String _sDbl(double v) {
        if(v==(long)v) return String.valueOf((long)v);
        return String.valueOf(v);
    }
    static String _json(String s) {
        StringBuilder r=new StringBuilder();
        for(int i=0;i<s.length();i++){
            char c=s.charAt(i);
            if(c=='\\\\') r.append("\\\\\\\\");
            else if(c=='\\"') r.append("\\\\\\"");
            else if(c=='\\n') r.append("\\\\n");
            else if(c=='\\r') r.append("\\\\r");
            else if(c=='\\t') r.append("\\\\t");
            else r.append(c);
        }
        return r.toString();
    }
`;

function buildCppRunner(
  userCode: string,
  testCases: { input: string; expectedOutput: string }[],
  sig: Signature
): string {
  const tests = testCases
    .map((tc) => `    {"${esc(tc.input)}", "${esc(tc.expectedOutput)}"}`)
    .join(",\n");

  const parseLines = sig.params.map((p) => `        ${cppParseCall(p.name, p.type)}`).join("\n");
  const callArgs = sig.params.map((p) => p.name).join(", ");
  const serExpr = cppSerialize(sig.ret, `_result`);
  const retType = CPP_TYPE[sig.ret] || "string";

  return `#include <bits/stdc++.h>
using namespace std;
${CPP_HELPERS}

${userCode}

int main() {
    string tests[][2] = {
${tests}
    };
    int n = ${testCases.length};
    cout << "[";
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << ",";
        string raw = tests[i][0];
        string expected = tests[i][1];
        string actual = "";
        string error = "";
        bool passed = false;
        try {
            int pos = 0;
${parseLines}
            ${retType} _result = ${sig.fn}(${callArgs});
            actual = ${serExpr};
            passed = (actual == expected);
        } catch (exception& e) {
            error = e.what();
        } catch (...) {
            error = "Runtime Error";
        }
        cout << "{\\"passed\\":" << (passed ? "true" : "false")
             << ",\\"actual\\":\\"" << _json(actual) << "\\""
             << ",\\"error\\":" << (error.empty() ? "null" : "\\"" + _json(error) + "\\"")
             << "}";
    }
    cout << "]" << endl;
}
`;
}

function buildJavaRunner(
  userCode: string,
  testCases: { input: string; expectedOutput: string }[],
  sig: Signature
): string {
  const tests = testCases
    .map((tc) => `            {"${esc(tc.input)}", "${esc(tc.expectedOutput)}"}`)
    .join(",\n");

  const parseLines = sig.params.map((p) => `                ${javaParseCall(p.name, p.type)}`).join("\n");
  const callArgs = sig.params.map((p) => p.name).join(", ");
  const jRetType = JAVA_TYPE[sig.ret] || "String";
  const serExpr = javaSerialize(sig.ret, "_result");

  return `import java.util.*;
import java.util.stream.*;
import java.io.*;

class Main {
${JAVA_HELPERS}

    ${userCode}

    public static void main(String[] args) {
        String[][] tests = {
${tests}
        };
        Main sol = new Main();
        StringBuilder out = new StringBuilder("[");
        for (int i = 0; i < tests.length; i++) {
            if (i > 0) out.append(",");
            String raw = tests[i][0];
            String expected = tests[i][1];
            String actual = "";
            String error = "";
            boolean passed = false;
            try {
                int[] pos = {0};
${parseLines}
                ${jRetType} _result = sol.${sig.fn}(${callArgs});
                actual = ${serExpr};
                passed = actual.equals(expected);
            } catch (Exception e) {
                error = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            }
            out.append("{\\"passed\\":").append(passed)
               .append(",\\"actual\\":\\"").append(_json(actual))
               .append("\\",\\"error\\":").append(error.isEmpty() ? "null" : "\\"" + _json(error) + "\\"")
               .append("}");
        }
        out.append("]");
        System.out.println(out);
    }
}
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
  lang: "cpp" | "java",
  userCode: string,
  testCases: { input: string; expectedOutput: string }[],
  sig: Signature
): Promise<TestCaseResult[]> {
  const runnerCode =
    lang === "cpp"
      ? buildCppRunner(userCode, testCases, sig)
      : buildJavaRunner(userCode, testCases, sig);

  const result = await runCode(lang, runnerCode);

  if (result.compileError) {
    return testCases.map((tc) => ({
      passed: false,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: "",
      error: "Compilation Error:\n" + result.compileError,
    }));
  }

  if (result.exitCode !== 0) {
    return testCases.map((tc) => ({
      passed: false,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: "",
      error: result.stderr || "Runtime Error",
    }));
  }

  try {
    const raw = JSON.parse(result.stdout.trim()) as { passed: boolean; actual: string; error: string | null }[];
    return raw.map((r, i) => ({
      passed: r.passed,
      input: testCases[i].input,
      expectedOutput: testCases[i].expectedOutput,
      actualOutput: r.actual,
      error: r.error,
    }));
  } catch {
    return testCases.map((tc) => ({
      passed: false,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: "",
      error: "Failed to parse output",
    }));
  }
}

export function generateStarterCpp(sig: Signature): string {
  const retType = CPP_TYPE[sig.ret] || "string";
  const params = sig.params.map((p) => cppParam(p.name, p.type)).join(", ");
  return `${retType} ${sig.fn}(${params}) {\n    \n}`;
}

export function generateStarterJava(sig: Signature): string {
  const retType = JAVA_TYPE[sig.ret] || "String";
  const params = sig.params.map((p) => javaParam(p.name, p.type)).join(", ");
  return `public ${retType} ${sig.fn}(${params}) {\n        \n    }`;
}
