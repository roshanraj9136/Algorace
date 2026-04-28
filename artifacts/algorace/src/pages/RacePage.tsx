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

  const [language, setLanguage] = useState<"javascript" | "python">("javascript");
  const [code, setCode] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [opponentProgress, setOpponentProgress] = useState<any>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (match?.problem) {
      setCode(language === "javascript" ? match.problem.starterCodeJs : match.problem.starterCodePy);
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
      setWinnerData(data);
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

    return () => {
      socket.emit("match:leave", { matchId });
      socket.off("match:progress");
      socket.off("match:finished");
      socket.off("match:abandoned");
    };
  }, [socket, matchId, user?.id, refetch, setLocation, toast]);

  useEffect(() => {
    let interval: any;
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

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} data-testid="button-back">
            Exit
          </Button>
          <div className="h-6 w-px bg-border" />
          <h1 className="font-bold flex items-center gap-2">
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
            <PlayerProgress 
              name={user?.name || "You"} 
              passed={myProgress?.testsPassedCount || 0} 
              total={match.problem.examples.length + 5} 
              isMe
            />
            <div className="h-8 w-px bg-border" />
            <PlayerProgress 
              name={opponent?.name || "Waiting..."} 
              passed={opponentProgress?.testsPassedCount ?? (opponent?.testsPassedCount || 0)} 
              total={match.problem.examples.length + 5} 
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

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r flex flex-col overflow-hidden bg-card/30">
          <Tabs defaultValue="description" className="flex-1 flex flex-col">
            <TabsList className="px-4 border-b rounded-none bg-transparent">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="results">Test Results ({results.filter(r => r.passed).length}/{results.length})</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <TabsContent value="description" className="m-0 space-y-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg leading-relaxed">{match.problem.description}</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {match.problem.constraints.split("\n").map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="examples" className="m-0 space-y-6">
                {match.problem.examples.map((example, i) => (
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
                    Submit your code to see results
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

      <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-3xl font-bold">Race Finished!</DialogTitle>
            <DialogDescription className="text-lg">
              {winnerData?.winnerId === user?.id ? (
                <span className="text-success font-bold">VICTORY! You won the race!</span>
              ) : (
                <span className="text-destructive font-bold">DEFEAT. Better luck next time.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex justify-center gap-12">
            <div className="text-center">
              <div className="text-sm uppercase tracking-widest text-muted-foreground mb-1">ELO Change</div>
              <div className={`text-4xl font-black ${winnerData?.eloChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                {winnerData?.eloChange >= 0 ? '+' : ''}{winnerData?.eloChange}
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
    <div className="w-48 space-y-1">
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-tighter">
        <span className={isMe ? 'text-primary' : 'text-muted-foreground'}>{name}</span>
        <span>{passed}/{total}</span>
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
