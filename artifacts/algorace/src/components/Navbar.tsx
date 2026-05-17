import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { RatingBadge } from "./RatingBadge";
import { LogOut, Trophy, LayoutDashboard, Code2, Users, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-card px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8">
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

        <div className="flex items-center gap-2 sm:gap-4">
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
                className="hidden sm:flex"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          )}
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border mt-3 pt-3 pb-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4 text-primary" />
            Dashboard
          </Link>
          <Link
            href="/problems"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <Code2 className="w-4 h-4 text-primary" />
            Problems
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <Trophy className="w-4 h-4 text-primary" />
            Leaderboard
          </Link>
          {user && (
            <button
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors w-full text-left text-destructive"
              onClick={() => { logout(); setMobileOpen(false); }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
