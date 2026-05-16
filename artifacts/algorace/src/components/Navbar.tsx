import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { RatingBadge } from "./RatingBadge";
import { LogOut, Trophy, LayoutDashboard, Code2, Users } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-border bg-card px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary tracking-tighter flex items-center gap-2" data-testid="link-logo">
            <Code2 className="w-6 h-6" />
            ALGORACE
          </Link>
          
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-primary flex items-center gap-1" data-testid="link-dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="/problems" className="text-sm font-medium hover:text-primary flex items-center gap-1" data-testid="link-problems">
              <Code2 className="w-4 h-4" />
              Problems
            </Link>
            <Link href="/leaderboard" className="text-sm font-medium hover:text-primary flex items-center gap-1" data-testid="link-leaderboard">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link href={`/profile/${user.id}`} className="flex items-center gap-2 hover:opacity-80" data-testid="link-profile">
                <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                <RatingBadge rating={user.elo} />
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => logout()} 
                data-testid="button-logout"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
