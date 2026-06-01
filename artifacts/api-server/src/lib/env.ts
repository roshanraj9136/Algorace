export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
}

export function getCorsOrigin(): string | true {
  if (process.env["NODE_ENV"] === "production") {
    return requireEnv("CORS_ORIGIN");
  }
  const explicit = process.env["CORS_ORIGIN"];
  if (explicit) return explicit;
  return true;
}
