import jwt from "jsonwebtoken";
import crypto from "crypto";

function loadSecret(): string {
  const fromEnv = process.env["JWT_SECRET"];
  if (fromEnv) return fromEnv;
  if (process.env["NODE_ENV"] === "production") {
    throw new Error("JWT_SECRET must be set in production");
  }
  const ephemeral = crypto.randomBytes(64).toString("hex");
  console.warn(
    "[jwt] JWT_SECRET not set - using a random secret for this process. Set JWT_SECRET in Replit Secrets to persist tokens across restarts."
  );
  return ephemeral;
}

const JWT_SECRET = loadSecret();
const JWT_EXPIRES_IN = "7d";

export type JwtPayload = {
  userId: number;
  email: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
