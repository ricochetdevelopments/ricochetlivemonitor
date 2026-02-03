import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { Bot, UpdateBotRequest, Visitor } from "@shared/api";

// In-memory storage (will be reset on server restart)
// In production, use a database like Supabase or MongoDB
let botStates: Record<string, Bot> = {};
let visitors: Visitor[] = [];

// Initialize bot states
function initializeBots() {
  const today = new Date().toLocaleDateString("en-CA");
  const currentHour = new Date().getHours().toString().padStart(2, "0");
  const currentMinute = new Date().getMinutes().toString().padStart(2, "0");
  const currentTime = `${currentHour}:${currentMinute}`;

  botStates = {
    "bot-1": {
      id: "bot-1",
      name: "Ricochet",
      status: "online",
      lastUpdate: `${today} ${currentTime}`,
      uptime: 98.5,
    },
    "bot-2": {
      id: "bot-2",
      name: "Custom Bot Hosting",
      status: "online",
      lastUpdate: `${today} ${currentTime}`,
      uptime: 99.2,
    },
    "bot-3": {
      id: "bot-3",
      name: "Ricochet API",
      status: "online",
      lastUpdate: `${today} ${currentTime}`,
      uptime: 85.3,
    },
    "bot-4": {
      id: "bot-4",
      name: "Server",
      status: "online",
      lastUpdate: `${today} ${currentTime}`,
      uptime: 92.1,
    },
  };
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize bots on startup
  if (Object.keys(botStates).length === 0) {
    initializeBots();
  }

  // IP tracking middleware
  app.use((_req, res, next) => {
    try {
      const ip =
        _req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
        _req.socket.remoteAddress ||
        "unknown";

      // Track visitor if not a localhost/internal request
      if (!ip.includes("127.0.0.1") && !ip.includes("::1")) {
        const visitor: Visitor = {
          ip,
          timestamp: new Date().toISOString(),
          userAgent: _req.headers["user-agent"] || "unknown",
        };
        visitors.push(visitor);
      }
    } catch (error) {
      console.error("Error in IP tracking middleware:", error);
    }
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Bot API routes
  app.get("/api/bots", (_req, res) => {
    try {
      if (Object.keys(botStates).length === 0) {
        initializeBots();
      }
      res.json({ bots: Object.values(botStates) });
    } catch (error) {
      console.error("Error in GET /api/bots:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/bots/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdateBotRequest;

      if (!botStates[id]) {
        return res.status(404).json({ error: "Bot not found" });
      }

      if (!["online", "offline", "restarting"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const today = new Date().toLocaleDateString("en-CA");
      const currentHour = new Date().getHours().toString().padStart(2, "0");
      const currentMinute = new Date().getMinutes().toString().padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;

      botStates[id] = {
        ...botStates[id],
        status,
        lastUpdate: `${today} ${currentTime}`,
      };

      res.json({ bot: botStates[id] });
    } catch (error) {
      console.error("Error in PUT /api/bots/:id:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Visitor tracking routes
  app.get("/api/visitors", (_req, res) => {
    try {
      // Remove duplicate IPs, keep most recent
      const uniqueVisitors = Array.from(
        new Map(visitors.reverse().map((v) => [v.ip, v])).values(),
      ).reverse();

      res.json({ visitors: uniqueVisitors });
    } catch (error) {
      console.error("Error in GET /api/visitors:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Error handling middleware
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("Unhandled error:", err);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
