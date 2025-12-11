import type { Request, Response, NextFunction } from "express";

// Simple CORS whitelist without external deps. Use env var `CORS_ORIGINS` as comma-separated list.
const parseOrigins = () => {
  const raw = process.env.CORS_ORIGINS || "";
  return raw.split(",").map(s => s.trim()).filter(Boolean);
};

export function corsWhitelist() {
  const allowed = new Set(parseOrigins());
  const allowAll = allowed.size === 0; // default: allow none unless not configured → allow same-origin only

  return function (req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin as string | undefined;

    if (origin && (allowAll || allowed.has(origin))) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Request-Id");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  };
}
