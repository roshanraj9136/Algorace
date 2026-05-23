import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetMatch, 
  useSubmitCode, 
  getGetMatchQueryKey 
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { Play, Send, Trophy, Swords, Timer, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

  const totalTests = match.problem.examples.length + 5;

  // Shared problem description content
  const ProblemContent = () => (
    <div className="space-y-6">
      <div className="prose prose-invert max-w-none break-words">
        <p className="text-[15px] leading-relaxed text-foreground/90">{match.problem.description}</p>
      </div>

      {match.problem.examples.map((example, i) => (
        <div key={i} className="space-y-2 max-w-full min-w-0">
          <h3 className="font-semibold text-sm text-foreground">Example {i + 1}:</h3>
          <div className="bg-muted/50 rounded-lg border border-border/60 p-3 sm:p-4 space-y-2 font-mono text-xs sm:text-sm overflow-x-auto">
            <div className="whitespace-pre">
              <span className="text-muted-foreground">Input: </span>
              <span className="text-foreground">{example.input}</span>
            </div>
            <div className="whitespace-pre">
              <span className="text-muted-foreground">Output: </span>
              <span className="text-foreground">{example.output}</span>
            </div>
            {example.explanation && (
              <div className="pt-2 mt-2 border-t border-border/40 whitespace-normal">
                <span className="text-muted-foreground">Explanation: </span>
                <span className="text-foreground/80 font-sans text-[13px]">{example.explanation}</span>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="space-y-3 max-w-full">
        <h3 className="font-semibold text-sm text-foreground">Constraints:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {match.problem.constraints.split("\n").map((c, i) => (
            <li key={i} className="font-mono text-[13px] break-words whitespace-pre-wrap">{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Shared test results content
  const ResultsContent = () => (
    <div className="space-y-4">
      {results.length > 0 ? (
        results.map((res, i) => (
          <div key={i} className={`p-3 sm:p-4 rounded-lg border ${res.passed ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                {res.passed ? <CheckCircle2 className="text-success w-4 h-4" /> : <XCircle className="text-destructive w-4 h-4" />}
                Test Case {i + 1}
              </div>
              <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${res.passed ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {res.passed ? 'Passed' : 'Failed'}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono w-full">
              <div className="space-y-1 min-w-0">
                <div className="text-muted-foreground">Expected</div>
                <pre className="bg-background p-2 rounded overflow-x-auto max-h-32 overflow-y-auto whitespace-pre">{res.expectedOutput}</pre>
              </div>
              <div className="space-y-1 min-w-0">
                <div className="text-muted-foreground">Actual</div>
                <pre className="bg-background p-2 rounded overflow-x-auto max-h-32 overflow-y-auto whitespace-pre">{res.actualOutput}</pre>
              </div>
            </div>
            {res.error && (
              <div className="mt-3 p-2 bg-destructive/10 text-destructive rounded text-xs font-mono whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                {res.error}
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="h-40 sm:h-64 flex flex-col items-center justify-center text-muted-foreground gap-2 border border-dashed rounded-lg">
          <Play className="w-8 h-8 opacity-20" />
          Submit your code to see results
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header Bar */}
      <div className="border-b bg-card px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} data-testid="button-back" className="shrink-0">
            Exit
          </Button>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <h1 className="font-bold flex items-center gap-2 text-sm sm:text-base truncate">
            {match.problem.title}
            <DifficultyBadge difficulty={match.problem.difficulty} />
          </h1>
        </div>

        <div className="flex items-center gap-3 sm:gap-8 flex-wrap">
          {match.status === "active" && (
            <div className="flex items-center gap-2 font-mono text-lg sm:text-xl text-primary" data-testid="text-timer">
              <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
              {formatTime(elapsed)}
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-6">
            <PlayerProgress 
              name={user?.name || "You"} 
              passed={myProgress?.testsPassedCount || 0} 
              total={totalTests} 
              isMe
            />
            <div className="h-6 sm:h-8 w-px bg-border" />
            <PlayerProgress 
              name={opponent?.name || "Waiting..."} 
              passed={opponentProgress?.testsPassedCount ?? (opponent?.testsPassedCount || 0)} 
              total={totalTests} 
            />
          </div>
        </div>

        {match.status === "waiting" && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Invite Code:</span>
            <code className="bg-muted px-2 py-1 rounded font-bold text-primary select-all">{match.inviteCode}</code>
          </div>
        )}
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
            <div className="flex items-center gap-2">
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
        <div className="border-b bg-card/50 flex">
          <button
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${mobileTab === 'problem' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setMobileTab('problem')}
          >
            Problem
          </button>
          <button
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${mobileTab === 'code' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setMobileTab('code')}
          >
            Code
          </button>
          <button
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors ${mobileTab === 'results' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
            onClick={() => setMobileTab('results')}
          >
            Results ({results.filter(r => r.passed).length}/{results.length})
          </button>
        </div>

        {/* Mobile Content */}
        {mobileTab === 'problem' && (
          <div className="flex-1 overflow-y-auto p-4">
            <ProblemContent />
          </div>
        )}

        {mobileTab === 'code' && (
          <div className="flex-1 flex flex-col">
            <div className="border-b px-3 py-2 flex items-center justify-between bg-card/50">
              <Select value={language} onValueChange={(val) => setLanguage(val as "cpp" | "java")}>
                <SelectTrigger className="w-24 h-8 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                size="sm" 
                className="font-bold gap-1.5 text-xs" 
                onClick={handleSubmit} 
                disabled={isSubmitting || match.status !== 'active'}
                data-testid="button-submit-mobile"
              >
                <Send className="w-3.5 h-3.5" />
                SUBMIT
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
                  padding: { top: 12, bottom: 12 },
                  wordWrap: "on",
                }}
              />
            </div>
          </div>
        )}

        {mobileTab === 'results' && (
          <div className="flex-1 overflow-y-auto p-4">
            <ResultsContent />
          </div>
        )}
      </div>

      <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
        <DialogContent className="sm:max-w-md text-center max-w-[90vw]">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-2xl sm:text-3xl font-bold">Race Finished!</DialogTitle>
            <DialogDescription className="text-base sm:text-lg">
              {winnerData?.winnerId === user?.id ? (
                <span className="text-success font-bold">VICTORY! You won the race!</span>
              ) : (
                <span className="text-destructive font-bold">DEFEAT. Better luck next time.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 sm:py-6 flex justify-center gap-12">
            <div className="text-center">
              <div className="text-sm uppercase tracking-widest text-muted-foreground mb-1">Rating Change</div>
              <div className={`text-3xl sm:text-4xl font-black ${(winnerData?.eloChange ?? 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {(winnerData?.eloChange ?? 0) >= 0 ? '+' : ''}{winnerData?.eloChange ?? 0}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={() => setLocation("/")}>Back to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlayerProgress({ name, passed, total, isMe }: { name: string; passed: number; total: number; isMe?: boolean }) {
  const percentage = Math.min(100, (passed / total) * 100);
  
  return (
    <div className="w-28 sm:w-48 space-y-1">
      <div className="flex justify-between text-[9px] sm:text-[10px] uppercase font-bold tracking-tighter">
        <span className={`truncate ${isMe ? 'text-primary' : 'text-muted-foreground'}`}>{name}</span>
        <span className="shrink-0">{passed}/{total}</span>
      </div>
      <div className="h-1 sm:h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${isMe ? 'bg-primary' : 'bg-muted-foreground/50'}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
