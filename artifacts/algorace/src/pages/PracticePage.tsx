import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetProblem, 
  useRunPractice,
  getGetProblemQueryKey
} from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { Play, Code2, CheckCircle2, XCircle } from "lucide-react";

export default function PracticePage() {
  const { id: problemIdParam } = useParams<{ id: string }>();
  const id = parseInt(problemIdParam);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: problem } = useGetProblem(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProblemQueryKey(id),
    }
  });

  const { mutate: runPractice, isPending: isRunning } = useRunPractice();

  const [language, setLanguage] = useState<"javascript" | "python">("javascript");
  const [code, setCode] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (problem) {
      setCode(language === "javascript" ? problem.starterCodeJs : problem.starterCodePy);
    }
  }, [problem, language]);

  const handleRun = () => {
    runPractice({
      id,
      data: {
        language,
        code
      }
    }, {
      onSuccess: (res) => {
        setResults(res.results);
        setActiveTab("results");
        if (res.passed === res.total) {
          toast({
            title: "Success!",
            description: "All practice test cases passed!",
          });
        } else {
          toast({
            title: "Test Cases Failed",
            description: `${res.passed}/${res.total} passed.`,
            variant: "destructive",
          });
        }
      },
      onError: (err) => {
        const apiError = err as { data?: { error?: string } };
        toast({
          title: "Error",
          description: apiError.data?.error || "Execution failed",
          variant: "destructive",
        });
      }
    });
  };

  if (!problem) return null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/problems")} data-testid="button-back">
            Back to Bank
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-bold flex items-center gap-2">
            <span className="text-muted-foreground font-mono mr-1">#{problem.id}</span>
            {problem.title}
            <DifficultyBadge difficulty={problem.difficulty} />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">PRACTICE MODE</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r flex flex-col overflow-hidden bg-card/30">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="px-4 border-b rounded-none bg-transparent">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="results">Test Results ({results.filter(r => r.passed).length}/{results.length})</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <TabsContent value="description" className="m-0 space-y-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed">{problem.description}</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {problem.constraints.split("\n").map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map(tag => (
                    <span key={tag} className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-muted rounded-full border border-border">
                      {tag}
                    </span>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="examples" className="m-0 space-y-6">
                {problem.examples.map((example, i) => (
                  <div key={i} className="space-y-3 p-4 bg-muted/50 rounded-lg border">
                    <div className="font-bold text-xs uppercase tracking-widest text-primary">Example {i + 1}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Input</div>
                        <pre className="bg-background p-2 rounded text-xs font-mono">{example.input}</pre>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] uppercase text-muted-foreground font-bold">Output</div>
                        <pre className="bg-background p-2 rounded text-xs font-mono">{example.output}</pre>
                      </div>
                    </div>
                    {example.explanation && (
                      <div className="text-sm text-muted-foreground pt-2 italic border-t border-border/50">
                        {example.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="results" className="m-0 space-y-4">
                {results.length > 0 ? (
                  results.map((res, i) => (
                    <div key={i} className={`p-4 rounded-lg border ${res.passed ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 font-bold">
                          {res.passed ? <CheckCircle2 className="text-success w-4 h-4" /> : <XCircle className="text-destructive w-4 h-4" />}
                          Test Case {i + 1}
                        </div>
                        <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${res.passed ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                          {res.passed ? 'Passed' : 'Failed'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Expected</div>
                          <pre className="bg-background p-2 rounded truncate">{res.expectedOutput}</pre>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground">Actual</div>
                          <pre className="bg-background p-2 rounded truncate">{res.actualOutput}</pre>
                        </div>
                      </div>
                      {res.error && (
                        <div className="mt-3 p-2 bg-destructive/10 text-destructive rounded text-xs font-mono whitespace-pre-wrap">
                          {res.error}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2 border border-dashed rounded-lg">
                    <Play className="w-8 h-8 opacity-20" />
                    Run your code to see results
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="w-1/2 flex flex-col bg-background">
          <div className="border-b px-4 py-2 flex items-center justify-between bg-card/50">
            <Select value={language} onValueChange={(val) => setLanguage(val as "javascript" | "python")}>
              <SelectTrigger className="w-32 h-8 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              className="font-bold gap-2" 
              onClick={handleRun} 
              disabled={isRunning}
              data-testid="button-run"
            >
              <Play className="w-4 h-4 fill-current" />
              RUN CODE
            </Button>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
