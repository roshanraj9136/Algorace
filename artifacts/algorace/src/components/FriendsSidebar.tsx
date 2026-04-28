import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  useListFriends,
  useListFriendRequests,
  useSearchUsers,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useDeclineFriendRequest,
  useRemoveFriend,
  useChallengeFriend,
  useJoinMatchByCode,
  getListFriendsQueryKey,
  getListFriendRequestsQueryKey,
  getSearchUsersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ToastAction } from "@/components/ui/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EloBadge } from "./EloBadge";
import {
  UserPlus,
  Users,
  Check,
  X,
  Search,
  Swords,
  Trash2,
  Mail,
  Bell,
} from "lucide-react";
import { Link } from "wouter";

function initialsFor(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function FriendsSidebar() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const { data: friends = [] } = useListFriends();
  const { data: requests = [] } = useListFriendRequests();
  const { data: searchResults = [], isFetching: isSearching } = useSearchUsers(
    { q: submittedSearch },
    {
      query: {
        enabled: submittedSearch.length > 0,
        queryKey: getSearchUsersQueryKey({ q: submittedSearch }),
      },
    }
  );

  const { mutate: sendRequest } = useSendFriendRequest();
  const { mutate: acceptRequest } = useAcceptFriendRequest();
  const { mutate: declineRequest } = useDeclineFriendRequest();
  const { mutate: removeFriend } = useRemoveFriend();
  const { mutate: challengeFriend, isPending: isChallenging } = useChallengeFriend();
  const { mutate: joinMatchByCode } = useJoinMatchByCode();

  useEffect(() => {
    if (!socket) return;

    const onRequest = (req: { requesterName: string }) => {
      toast({
        title: "New friend request",
        description: `${req.requesterName} wants to be your friend`,
      });
      void queryClient.invalidateQueries({ queryKey: getListFriendRequestsQueryKey() });
    };

    const onAccepted = () => {
      toast({ title: "Friend request accepted" });
      void queryClient.invalidateQueries({ queryKey: getListFriendsQueryKey() });
    };

    const onChallenge = (challenge: {
      matchId: number;
      inviteCode: string;
      fromName: string;
      problemTitle: string;
    }) => {
      const accept = () => {
        joinMatchByCode(
          { inviteCode: challenge.inviteCode },
          {
            onSuccess: (match) => setLocation(`/race/${match.id}`),
            onError: (err) => {
              const apiError = err as { data?: { error?: string } };
              toast({
                title: "Couldn't join challenge",
                description: apiError.data?.error || "Match no longer available",
                variant: "destructive",
              });
            },
          }
        );
      };
      toast({
        title: `${challenge.fromName} challenged you!`,
        description: `Problem: ${challenge.problemTitle}. Tap to accept.`,
        duration: 30000,
        action: (
          <ToastAction
            altText="Accept challenge"
            onClick={accept}
            data-testid="button-accept-challenge"
          >
            Accept
          </ToastAction>
        ),
      });
    };

    socket.on("friend:request", onRequest);
    socket.on("friend:accepted", onAccepted);
    socket.on("friend:challenge", onChallenge);

    return () => {
      socket.off("friend:request", onRequest);
      socket.off("friend:accepted", onAccepted);
      socket.off("friend:challenge", onChallenge);
    };
  }, [socket, queryClient, toast, setLocation]);

  const refetchAll = () => {
    void queryClient.invalidateQueries({ queryKey: getListFriendsQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getListFriendRequestsQueryKey() });
    if (submittedSearch) {
      void queryClient.invalidateQueries({
        queryKey: getSearchUsersQueryKey({ q: submittedSearch }),
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(search.trim());
  };

  const handleSendRequest = (userId: number) => {
    sendRequest(
      { data: { userId } },
      {
        onSuccess: () => {
          toast({ title: "Friend request sent" });
          refetchAll();
        },
        onError: (err) => {
          const apiError = err as { data?: { error?: string } };
          toast({
            title: "Error",
            description: apiError.data?.error || "Failed to send request",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleAccept = (id: number) => {
    acceptRequest(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Friend added" });
          refetchAll();
        },
        onError: (err) => {
          const apiError = err as { data?: { error?: string } };
          toast({
            title: "Error",
            description: apiError.data?.error || "Failed to accept",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDecline = (id: number) => {
    declineRequest(
      { id },
      {
        onSuccess: () => refetchAll(),
        onError: (err) => {
          const apiError = err as { data?: { error?: string } };
          toast({
            title: "Error",
            description: apiError.data?.error || "Failed to decline",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemove = (userId: number) => {
    removeFriend(
      { userId },
      {
        onSuccess: () => {
          toast({ title: "Friend removed" });
          refetchAll();
        },
      }
    );
  };

  const handleChallenge = (userId: number) => {
    challengeFriend(
      { userId, data: {} },
      {
        onSuccess: (match) => {
          toast({ title: "Challenge sent", description: "Waiting for them to accept..." });
          setLocation(`/race/${match.id}`);
        },
        onError: (err) => {
          const apiError = err as { data?: { error?: string } };
          toast({
            title: "Error",
            description: apiError.data?.error || "Failed to challenge",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <Card data-testid="card-friends">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="text-primary" />
          Friends
        </CardTitle>
        <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1" data-testid="button-add-friend">
              <UserPlus className="w-4 h-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Find friends</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                data-testid="input-search-users"
              />
              <Button type="submit" size="icon" data-testid="button-search-users">
                <Search className="w-4 h-4" />
              </Button>
            </form>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {isSearching && <p className="text-sm text-muted-foreground">Searching...</p>}
              {!isSearching && submittedSearch && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
              )}
              {searchResults.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-border"
                  data-testid={`row-search-user-${u.id}`}
                >
                  <Avatar className="w-9 h-9 bg-primary text-primary-foreground">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {initialsFor(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <EloBadge elo={u.elo} className="text-xs" />
                  {u.relationship === "none" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendRequest(u.id)}
                      data-testid={`button-send-request-${u.id}`}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  )}
                  {u.relationship === "pending_outgoing" && (
                    <span className="text-xs text-muted-foreground italic">Pending</span>
                  )}
                  {u.relationship === "pending_incoming" && (
                    <span className="text-xs text-primary italic">Awaiting you</span>
                  )}
                  {u.relationship === "friends" && (
                    <span className="text-xs text-success italic">Friends</span>
                  )}
                  {u.relationship === "self" && (
                    <span className="text-xs text-muted-foreground italic">You</span>
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length > 0 && (
          <div className="space-y-2" data-testid="section-friend-requests">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Bell className="w-3 h-3" />
              Pending requests ({requests.length})
            </p>
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center gap-2 p-2 rounded-lg border border-primary/30 bg-primary/5"
                data-testid={`row-request-${req.id}`}
              >
                <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initialsFor(req.requesterName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${req.requesterId}`}
                    className="text-sm font-semibold hover:underline truncate block"
                  >
                    {req.requesterName}
                  </Link>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{req.requesterEmail}</span>
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-success"
                  onClick={() => handleAccept(req.id)}
                  data-testid={`button-accept-${req.id}`}
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDecline(req.id)}
                  data-testid={`button-decline-${req.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {friends.length > 0 ? (
            friends.map((friend) => (
              <div
                key={friend.userId}
                className="flex items-center gap-2 p-2 rounded-lg border border-border hover:border-primary/40 transition-colors"
                data-testid={`row-friend-${friend.userId}`}
              >
                <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initialsFor(friend.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${friend.userId}`}
                    className="text-sm font-semibold hover:underline truncate block"
                  >
                    {friend.name}
                  </Link>
                  <EloBadge elo={friend.elo} className="text-[10px] py-0 px-1.5" />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-primary"
                  disabled={isChallenging}
                  onClick={() => handleChallenge(friend.userId)}
                  title="Challenge"
                  data-testid={`button-challenge-${friend.userId}`}
                >
                  <Swords className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemove(friend.userId)}
                  title="Remove friend"
                  data-testid={`button-remove-${friend.userId}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg text-sm">
              No friends yet. Add some!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
