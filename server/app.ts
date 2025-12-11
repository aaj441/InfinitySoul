import { Server } from "node:http";
import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { registerRoutes } from "./routes.ts";
import { validateStartup } from "./startup.ts";
import { logger } from "./logger.ts";
import { errorHandler } from "./middleware/error-handler.ts";
import { apiGeneralLimiter } from "./middleware/rate-limiter.ts";
import { activityLogger } from "./middleware/activity-logger.ts";
import { corsWhitelist } from "./middleware/cors-whitelist.ts";
import { initTracing } from "./tracing.ts";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Validate startup environment
validateStartup();

export const app = express();

// Security headers
app.use(helmet());

// CORS whitelist (configure allowed origins via CORS_ORIGINS)
app.use(corsWhitelist());

// Global rate limiter (fallback, in addition to custom)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
});
app.use(globalLimiter);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(activityLogger);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

export default async function runApp(
  setup: (app: Express, server: Server) => Promise<void>,
) {
  // Optional tracing initialization (OTEL_EXPORTER_OTLP_ENDPOINT required)
  await initTracing();
  const server = await registerRoutes(app);
  
  // Initialize browser backends
  const { browserBackendManager } = await import("./services/browser-backends");
  await browserBackendManager.initialize();
  
  // Start agentic automation system
  const { startAgents } = await import("./start-agents");
  startAgents();

  // Replace with structured error handler
  app.use(errorHandler);

  // importantly run the final setup after setting up all the other routes so
  // the catch-all route doesn't interfere with the other routes
  await setup(app, server);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    logger.info(`Server started on port ${port}`, {
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version,
    });
  });
}
