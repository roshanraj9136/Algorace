import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetMatch, 
  useSubmitCode, 
  getGetMatchQueryKey 
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { Play, Send, Trophy, Timer, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export default function RacePage() {
  const { matchId: matchIdParam } = useParams<{ matchId: string }>();
  const matchId = parseInt(matchIdParam);
  const { user } = useAuth();
  const socket = useSocket();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: match, refetch } = useGetMatch(matchId, {
    query: {
      enabled: !!matchId,
      queryKey: getGetMatchQueryKey(matchId),
      refetchInterval: (query) => {
        const data = query.state.data;
        return (data && data.status === "waiting") ? 3000 : false;
      },
    }
  });

  const { mutate: submitCode, isPending: isSubmitting } = useSubmitCode();

  interface TestCaseResult {
    passed: boolean;
    expectedOutput: string;
    actualOutput: string;
    error: string | null;
  }

  interface OpponentProgress {
    userId: number;
    testsPassedCount: number;
  }

  interface WinnerData {
    winnerId: number;
    eloChange: number;
    reason?: string;
  }

  const [language, setLanguage] = useState<"cpp" | "java">("cpp");
  const [code, setCode] = useState("");
  const [results, setResults] = useState<TestCaseResult[]>([]);
  const [opponentProgress, setOpponentProgress] = useState<OpponentProgress | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerData, setWinnerData] = useState<WinnerData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [mobileTab, setMobileTab] = useState<"problem" | "code" | "results">("code");
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    if (match?.problem) {
      setCode(language === "cpp" ? match.problem.starterCodeCpp : match.problem.starterCodeJava);
    }
  }, [match?.problem, language]);

  useEffect(() => {
    if (!socket || !matchId) return;

    socket.emit("match:join", { matchId });

    socket.on("match:progress", (data) => {
      if (data.userId !== user?.id) {
        setOpponentProgress(data);
      }
    });

    socket.on("match:finished", (data) => {
      const change = data.eloChanges?.[String(user?.id)] ?? data.eloChange ?? 0;
      setWinnerData({ ...data, eloChange: change });
      setShowWinnerModal(true);
      refetch();
    });

    socket.on("match:abandoned", () => {
      toast({
        title: "Match Abandoned",
        description: "Your opponent has left the match.",
        variant: "destructive",
      });
      setLocation("/lobby");
    });

    socket.on("match:player_joined", () => {
      toast({
        title: "Opponent Joined!",
        description: "The race is starting now!",
      });
      refetch();
    });

    return () => {
      socket.emit("match:leave", { matchId });
      socket.off("match:progress");
      socket.off("match:finished");
      socket.off("match:abandoned");
      socket.off("match:player_joined");
    };
  }, [socket, matchId, user?.id, refetch, setLocation, toast]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (match?.status === "active" && match.startedAt) {
      const start = new Date(match.startedAt).getTime();
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [match?.status, match?.startedAt]);

  const opponent = useMemo(() => {
    return match?.players.find(p => p.userId !== user?.id);
  }, [match?.players, user?.id]);

  const myProgress = useMemo(() => {
    return match?.players.find(p => p.userId === user?.id);
  }, [match?.players, user?.id]);

  const handleSubmit = () => {
    submitCode({
      data: {
        matchId,
        language,
        code
      }
    }, {
      onSuccess: (res) => {
        setResults(res.results);
        setActiveTab("results");
        setMobileTab("results");
        if (res.allPassed) {
          toast({
            title: "Success!",
            description: "All test cases passed. Waiting for match to finish...",
          });
        } else {
          toast({
            title: "Incorrect",
            description: `${res.passed}/${res.total} test cases passed.`,
            variant: "destructive",
          });
        }
      },
      onError: (err) => {
        const apiError = err as { data?: { error?: string } };
        toast({
          title: "Error",
          description: apiError.data?.error || "Submission failed",
          variant: "destructive",
        });
      }
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!match) return null;

  const totalTests = 10;
  const myPassed = myProgress?.testsPassedCount || 0;
  const oppPassed = opponentProgress?.testsPassedCount ?? (opponent?.testsPassedCount || 0);

  const ProblemContent = () => (
    <div className="space-y-5">
      <div className="prose prose-invert max-w-none break-words">
        <p className="text-sm leading-relaxed text-foreground/90">{match.problem.description}</p>
      </div>

      {match.problem.examples.map((example, i) => (
        <div key={i} className="space-y-1.5">
          <h3 className="font-semibold text-xs text-foreground">Example {i + 1}:</h3>
          <div className="bg-muted/50 rounded-lg border border-border/60 p-3 space-y-1.5 font-mono text-xs overflow-x-auto">
            <div className="whitespace-pre-wrap break-all">
              <span className="text-muted-foreground">Input: </span>
              <span className="text-foreground">{example.input}</span>
            </div>
            <div className="whitespace-pre-wrap break-all">
              <span className="text-muted-foreground">Output: </span>
              <span className="text-foreground">{example.output}</span>
            </div>
            {example.explanation && (
              <div className="pt-1.5 mt-1.5 border-t border-border/40">
                <span className="text-muted-foreground">Explanation: </span>
                <span className="text-foreground/80 font-sans text-xs">{example.explanation}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="space-y-2">
        <h3 className="font-semibold text-xs text-foreground">Constraints:</h3>
        <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
          {match.problem.constraints.split("\n").map((c, i) => (
            <li key={i} className="font-mono text-[11px] break-words whitespace-pre-wrap">{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  const ResultsContent = () => (
    <div className="space-y-3">
      {results.length > 0 ? (
        results.map((res, i) => (
          <div key={i} className={`p-3 rounded-lg border ${res.passed ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {res.passed ? <CheckCircle2 className="text-success w-3.5 h-3.5" /> : <XCircle className="text-destructive w-3.5 h-3.5" />}
                Test {i + 1}
              </div>
              <div className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${res.passed ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {res.passed ? 'Pass' : 'Fail'}
              </div>
            </div>
            <div className="space-y-2 text-[11px] font-mono">
              <div className="space-y-0.5">
                <div className="text-muted-foreground text-[10px]">Expected</div>
                <pre className="bg-background p-1.5 rounded overflow-x-auto max-h-20 overflow-y-auto whitespace-pre text-[11px]">{res.expectedOutput}</pre>
              </div>
              <div className="space-y-0.5">
                <div className="text-muted-foreground text-[10px]">Actual</div>
                <pre className="bg-background p-1.5 rounded overflow-x-auto max-h-20 overflow-y-auto whitespace-pre text-[11px]">{res.actualOutput}</pre>
              </div>
            </div>
            {res.error && (
              <div className="mt-2 p-1.5 bg-destructive/10 text-destructive rounded text-[11px] font-mono whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                {res.error}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="h-40 flex flex-col items-center justify-center text-muted-foreground gap-2 border border-dashed rounded-lg">
          <Play className="w-6 h-6 opacity-20" />
          <span className="text-xs">Submit your code to see results</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* ===== MOBILE HEADER ===== */}
      <div className="md:hidden border-b bg-card">
        {/* Top row: back + title + timer */}
        <div className="flex items-center justify-between px-3 py-2">
          <button onClick={() => setLocation("/")} className="p-1.5 -ml-1.5 rounded-md hover:bg-muted" aria-label="Exit">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center min-w-0 px-2">
            <h1 className="font-bold text-sm truncate">{match.problem.title}</h1>
          </div>
          {match.status === "active" ? (
            <div className="font-mono text-sm font-bold text-primary tabular-nums">
              {formatTime(elapsed)}
            </div>
          ) : (
            <DifficultyBadge difficulty={match.problem.difficulty} />
          )}
        </div>

        {/* Progress bars row */}
        <div className="flex items-center gap-2 px-3 pb-2">
          <MobileProgress 
            name={user?.name || "You"} 
            passed={myPassed} 
            total={totalTests} 
            isMe 
          />
          <span className="text-[10px] text-muted-foreground font-bold">VS</span>
          <MobileProgress 
            name={opponent?.name || "Waiting..."} 
            passed={oppPassed} 
            total={totalTests} 
          />
        </div>

        {/* Invite code for waiting state */}
        {match.status === "waiting" && (
          <div className="flex items-center justify-center gap-2 px-3 pb-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Invite:</span>
            <code className="bg-muted px-2 py-0.5 rounded text-xs font-bold text-primary select-all tracking-wider">{match.inviteCode}</code>
          </div>
        )}
      </div>

      {/* ===== DESKTOP HEADER ===== */}
      <div className="hidden md:flex border-b bg-card px-4 py-2 items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} data-testid="button-back">
            Exit
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-bold flex items-center gap-2 text-base truncate">
            {match.problem.title}
            <DifficultyBadge difficulty={match.problem.difficulty} />
          </h1>
        </div>

        <div className="flex items-center gap-8">
          {match.status === "active" && (
            <div className="flex items-center gap-2 font-mono text-xl text-primary" data-testid="text-timer">
              <Timer className="w-5 h-5" />
              {formatTime(elapsed)}
            </div>
          )}

          <div className="flex items-center gap-6">
            <DesktopProgress 
              name={user?.name || "You"} 
              passed={myPassed} 
              total={totalTests} 
              isMe
            />
            <div className="h-8 w-px bg-border" />
            <DesktopProgress 
              name={opponent?.name || "Waiting..."} 
              passed={oppPassed} 
              total={totalTests} 
            />
          </div>

          {match.status === "waiting" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Invite:</span>
              <code className="bg-muted px-2 py-1 rounded font-bold text-primary select-all">{match.inviteCode}</code>
            </div>
          )}
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (md+) ===== */}
      <div className="flex-1 hidden md:flex overflow-hidden">
        <div className="w-1/2 border-r flex flex-col overflow-hidden bg-card/30">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="px-4 border-b rounded-none bg-transparent">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="results">Test Results ({results.filter(r => r.passed).length}/{results.length})</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <TabsContent value="description" className="m-0">
                <ProblemContent />
              </TabsContent>
              <TabsContent value="results" className="m-0">
                <ResultsContent />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="w-1/2 flex flex-col bg-background">
          <div className="border-b px-4 py-2 flex items-center justify-between bg-card/50">
            <Select value={language} onValueChange={(val) => setLanguage(val as "cpp" | "java")}>
              <SelectTrigger className="w-32 h-8 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpp">C++</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              className="font-bold gap-2" 
              onClick={handleSubmit} 
              disabled={isSubmitting || match.status !== 'active'}
              data-testid="button-submit"
            >
              <Send className="w-4 h-4" />
              SUBMIT
            </Button>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : "java"}
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

      {/* ===== MOBILE LAYOUT (below md) ===== */}
      <div className="flex-1 flex flex-col md:hidden overflow-hidden">
        {/* Mobile Tab Bar */}
        <div className="border-b bg-card/80 flex shrink-0">
          {(["problem", "code", "results"] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors relative ${
                mobileTab === tab ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => setMobileTab(tab)}
            >
              {tab === "results" ? `Results (${results.filter(r => r.passed).length}/${results.length})` : tab}
              {mobileTab === tab && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Mobile Content */}
        {mobileTab === 'problem' && (
          <div className="flex-1 overflow-y-auto p-4 pb-6">
            <ProblemContent />
          </div>
        )}

        {mobileTab === 'code' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="border-b px-3 py-2 flex items-center justify-between bg-card/50 shrink-0">
              <Select value={language} onValueChange={(val) => setLanguage(val as "cpp" | "java")}>
                <SelectTrigger className="w-20 h-8 text-[11px] font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                size="sm" 
                className="font-bold gap-1.5 text-xs h-8 px-3" 
                onClick={handleSubmit} 
                disabled={isSubmitting || match.status !== 'active'}
                data-testid="button-submit-mobile"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    SUBMIT
                  </>
                )}
              </Button>
            </div>
            <div className="flex-1 relative min-h-0">
              <Editor
                height="100%"
                language={language === "cpp" ? "cpp" : "java"}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 8, bottom: 8 },
                  wordWrap: "on",
                  lineNumbersMinChars: 3,
                  folding: false,
                  glyphMargin: false,
                }}
              />
            </div>
          </div>
        )}

        {mobileTab === 'results' && (
          <div className="flex-1 overflow-y-auto p-3 pb-6">
            <ResultsContent />
          </div>
        )}
      </div>

      {/* Winner Modal */}
      <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
        <DialogContent className="sm:max-w-md text-center max-w-[85vw] rounded-2xl">
          <DialogHeader>
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-xl sm:text-3xl font-bold">Race Finished!</DialogTitle>
            <DialogDescription className="text-sm sm:text-lg">
              {winnerData?.winnerId === user?.id ? (
                <span className="text-success font-bold">VICTORY! You won! 🎉</span>
              ) : (
                <span className="text-destructive font-bold">DEFEAT. Next time! 💪</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex justify-center">
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Rating Change</div>
              <div className={`text-3xl sm:text-4xl font-black ${(winnerData?.eloChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {(winnerData?.eloChange ?? 0) >= 0 ? '+' : ''}{winnerData?.eloChange ?? 0}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full h-11" onClick={() => setLocation("/")}>Back to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MobileProgress({ name, passed, total, isMe }: { name: string; passed: number; total: number; isMe?: boolean }) {
  const percentage = Math.min(100, (passed / total) * 100);
  
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline mb-0.5">
        <span className={`text-[10px] font-bold truncate ${isMe ? 'text-primary' : 'text-muted-foreground'}`}>
          {name}
        </span>
        <span className="text-[10px] font-mono font-bold shrink-0 ml-1">{passed}/{total}</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isMe ? 'bg-primary' : 'bg-muted-foreground/60'}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function DesktopProgress({ name, passed, total, isMe }: { name: string; passed: number; total: number; isMe?: boolean }) {
  const percentage = Math.min(100, (passed / total) * 100);
  
  return (
    <div className="w-48 space-y-1">
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
        <span className={`truncate ${isMe ? 'text-primary' : 'text-muted-foreground'}`}>{name}</span>
        <span className="shrink-0">{passed}/{total}</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${isMe ? 'bg-primary' : 'bg-muted-foreground/50'}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
