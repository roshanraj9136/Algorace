import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGuard } from "@/components/AuthGuard";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import LobbyPage from "@/pages/LobbyPage";
import RacePage from "@/pages/RacePage";
import ProblemsPage from "@/pages/ProblemsPage";
import PracticePage from "@/pages/PracticePage";
import LeaderboardPage from "@/pages/LeaderboardPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route path="/">
        <AuthGuard>
          <DashboardPage />
        </AuthGuard>
      </Route>
      <Route path="/lobby">
        <AuthGuard>
          <LobbyPage />
        </AuthGuard>
      </Route>
      <Route path="/race/:matchId">
        <AuthGuard>
          <RacePage />
        </AuthGuard>
      </Route>
      <Route path="/problems">
        <AuthGuard>
          <ProblemsPage />
        </AuthGuard>
      </Route>
      <Route path="/problems/:id">
        <AuthGuard>
          <PracticePage />
        </AuthGuard>
      </Route>
      <Route path="/leaderboard">
        <AuthGuard>
          <LeaderboardPage />
        </AuthGuard>
      </Route>
      <Route path="/profile/:userId">
        <AuthGuard>
          <ProfilePage />
        </AuthGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
