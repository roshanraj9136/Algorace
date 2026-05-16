export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
}

export function getCorsOrigin(): string {
  if (process.env["NODE_ENV"] === "production") {
    return requireEnv("CORS_ORIGIN");
  }
  return process.env["CORS_ORIGIN"] || "*";
}
