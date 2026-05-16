import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  useJoinQueue, 
  useLeaveQueue, 
  useGetQueueStatus, 
  useCreateMatch, 
  useJoinMatchByCode,
  getGetQueueStatusQueryKey
} from "@workspace/api-client-react";
import { useSocket } from "@/hooks/useSocket";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Swords, Users, Plus, Play, Code2 } from "lucide-react";

export default function LobbyPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const socket = useSocket();
  const [inviteCode, setInviteCode] = useState("");

  const { data: queueStatus } = useGetQueueStatus({
    query: {
      enabled: true,
      queryKey: getGetQueueStatusQueryKey(),
      refetchInterval: 2000,
    }
  });

  const { mutate: joinQueue, isPending: isJoiningQueue } = useJoinQueue();
  const { mutate: leaveQueue, isPending: isLeavingQueue } = useLeaveQueue();
  const { mutate: createMatch, isPending: isCreatingMatch } = useCreateMatch();
  const { mutate: joinMatchByCode, isPending: isJoiningByCode } = useJoinMatchByCode();

  useEffect(() => {
    if (!socket) return;

    socket.on("queue:matched", ({ matchId }) => {
      setLocation(`/race/${matchId}`);
    });

    return () => {
      socket.off("queue:matched");
    };
  }, [socket, setLocation]);

  const handleJoinQueue = () => {
    joinQueue(undefined, {
      onError: (err: Error | { data?: { error?: string } }) => {
        const apiError = err as { data?: { error?: string } };
        toast({
          title: "Error",
          description: apiError.data?.error || "Failed to join queue",
          variant: "destructive",
        });
      }
    });
  };

  const handleLeaveQueue = () => {
    leaveQueue(undefined);
  };

  const handleCreateRoom = () => {
    createMatch({ data: {} }, {
      onSuccess: (match) => {
        setLocation(`/race/${match.id}`);
      },
      onError: (err: Error | { data?: { error?: string } }) => {
        const apiError = err as { data?: { error?: string } };
        toast({
          title: "Error",
          description: apiError.data?.error || "Failed to create match",
          variant: "destructive",
        });
      }
    });
  };

  const handleJoinByCode = () => {
    if (!inviteCode) return;
    joinMatchByCode({ inviteCode }, {
      onSuccess: (match) => {
        setLocation(`/race/${match.id}`);
      },
      onError: (err) => {
        const apiError = err as { data?: { error?: string } };
        toast({
          title: "Error",
          description: apiError.data?.error || "Invalid invite code",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Race Lobby</h1>
          <p className="text-muted-foreground text-lg">Choose your game mode and start competing</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="flex flex-col border-primary/20 bg-primary/5" data-testid="panel-quick-play">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="text-primary w-5 h-5 fill-current" />
                Quick Play
              </CardTitle>
              <CardDescription>Match against a random opponent near your rating</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center py-8">
              {queueStatus?.inQueue ? (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <Spinner className="size-8 text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
                      {queueStatus.queueSize}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-primary animate-pulse">Finding a match...</p>
                    <p className="text-sm text-muted-foreground">{queueStatus.queueSize} players in queue</p>
                  </div>
                  <Button variant="outline" onClick={handleLeaveQueue} disabled={isLeavingQueue} data-testid="button-leave-queue">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  className="w-full h-16 text-lg font-bold gap-3" 
                  onClick={handleJoinQueue}
                  disabled={isJoiningQueue}
                  data-testid="button-join-queue"
                >
                  <Users className="w-6 h-6" />
                  JOIN QUEUE
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="flex flex-col border-secondary/20" data-testid="panel-create-room">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="text-secondary w-5 h-5" />
                Create Private Room
              </CardTitle>
              <CardDescription>Challenge a friend to a specific problem</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center py-8">
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full h-16 text-lg font-bold gap-3" 
                onClick={handleCreateRoom}
                disabled={isCreatingMatch}
                data-testid="button-create-match"
              >
                <Swords className="w-6 h-6" />
                CREATE ROOM
              </Button>
            </CardContent>
          </Card>

          <Card className="flex flex-col border-accent/20" data-testid="panel-join-room">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="text-accent w-5 h-5" />
                Join Room
              </CardTitle>
              <CardDescription>Enter a room code to join a private match</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center py-8 gap-4">
              <Input 
                placeholder="Enter invite code..." 
                className="h-12 text-center text-lg uppercase tracking-widest font-mono"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                data-testid="input-invite-code"
              />
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full h-12 font-bold"
                onClick={handleJoinByCode}
                disabled={!inviteCode || isJoiningByCode}
                data-testid="button-join-by-code"
              >
                JOIN MATCH
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function History(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
