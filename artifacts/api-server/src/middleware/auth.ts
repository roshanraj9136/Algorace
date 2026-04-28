import { type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "../lib/jwt";

export type AuthRequest = Request & {
  userId: number;
  userEmail: string;
};

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    (req as AuthRequest).userId = payload.userId;
    (req as AuthRequest).userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
