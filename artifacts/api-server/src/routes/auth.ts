import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, name, password } = req.body as {
    email?: string;
    name?: string;
    password?: string;
  };

  if (!email || !name || !password) {
    res.status(400).json({ error: "email, name, and password are required" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(usersTable)
    .values({ email, name, passwordHash })
    .returning();

  const token = signToken({ userId: user!.id, email: user!.email });
  res.status(201).json({
    token,
    id: user!.id,
    email: user!.email,
    name: user!.name,
    elo: user!.elo,
    wins: user!.wins,
    losses: user!.losses,
    createdAt: user!.createdAt,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    id: user.id,
    email: user.email,
    name: user.name,
    elo: user.elo,
    wins: user.wins,
    losses: user.losses,
    createdAt: user.createdAt,
  });
});

router.post("/logout", requireAuth, (_req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, authReq.userId))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    elo: user.elo,
    wins: user.wins,
    losses: user.losses,
    createdAt: user.createdAt,
  });
});

export default router;
