import { useState } from "react";
import { useListProblems } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Search, Filter, Code2, ChevronRight } from "lucide-react";

export default function ProblemsPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");

  const { data: problems = [], isLoading } = useListProblems({
    search: search || undefined,
    difficulty: difficulty === "all" ? undefined : difficulty as "easy" | "medium" | "hard",
  });

  const difficulties = ["all", "easy", "medium", "hard"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Problem Bank</h1>
            <p className="text-muted-foreground">Master your skills with our curated set of challenges</p>
          </div>
          <div className="flex w-full md:w-auto items-center gap-4">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search problems..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-problems"
              />
            </div>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-[140px]" data-testid="select-difficulty">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((d) => (
                  <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-4 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-8 w-24 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : problems.length > 0 ? (
                  problems.map((problem) => (
                    <TableRow key={problem.id} className="group hover:bg-accent/50 transition-colors" data-testid={`row-problem-${problem.id}`}>
                      <TableCell className="text-muted-foreground font-mono">{problem.id}</TableCell>
                      <TableCell className="font-semibold">{problem.title}</TableCell>
                      <TableCell>
                        <DifficultyBadge difficulty={problem.difficulty} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {problem.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-muted rounded border border-border">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/problems/${problem.id}`}>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-practice-${problem.id}`}>
                            Practice
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No problems found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
