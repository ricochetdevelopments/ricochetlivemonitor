import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type BotStatus = "online" | "offline" | "restarting";

export interface Event {
  id: string;
  timestamp: string;
  type: "status_change" | "restart" | "error" | "recovery";
  message: string;
  details: string;
}

export interface DowntimeEstimate {
  date: string;
  incidents: number;
  totalDowntime: number;
  affectedServices: string[];
  severity: "low" | "medium" | "high";
}

export interface Bot {
  id: string;
  name: string;
  status: BotStatus;
  lastUpdate: string;
  uptime: number;
}

interface BotContextType {
  bots: Bot[];
  events: Record<string, Event[]>;
  downtime: Record<string, DowntimeEstimate[]>;
  updateBotStatus: (botId: string, newStatus: BotStatus) => void;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

const TODAY = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD format
const NOW = new Date();
const CURRENT_TIME = `${String(NOW.getHours()).padStart(2, "0")}:${String(NOW.getMinutes()).padStart(2, "0")}:${String(NOW.getSeconds()).padStart(2, "0")}`;

const INITIAL_BOTS: Bot[] = [
  {
    id: "bot-1",
    name: "Ricochet",
    status: "online",
    lastUpdate: `${TODAY} ${CURRENT_TIME}`,
    uptime: 98.5,
  },
  {
    id: "bot-2",
    name: "Custom Bot Hosting",
    status: "online",
    lastUpdate: `${TODAY} ${CURRENT_TIME}`,
    uptime: 99.2,
  },
  {
    id: "bot-3",
    name: "Ricochet API",
    status: "offline",
    lastUpdate: `${TODAY} ${CURRENT_TIME}`,
    uptime: 85.3,
  },
  {
    id: "bot-4",
    name: "Server",
    status: "restarting",
    lastUpdate: `${TODAY} ${CURRENT_TIME}`,
    uptime: 92.1,
  },
];

const getInitialBots = (): Bot[] => {
  if (typeof window === "undefined") return INITIAL_BOTS;

  try {
    const saved = localStorage.getItem("bot-monitor-bots");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load bots from localStorage:", error);
  }
  return INITIAL_BOTS;
};

const getInitialEvents = (): Record<string, Event[]> => {
  if (typeof window === "undefined") {
    return {
      "bot-1": [],
      "bot-2": [],
      "bot-3": [],
      "bot-4": [],
    };
  }

  try {
    const saved = localStorage.getItem("bot-monitor-events");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load events from localStorage:", error);
  }
  return {
    "bot-1": [],
    "bot-2": [],
    "bot-3": [],
    "bot-4": [],
  };
};

const getInitialDowntime = (): Record<string, DowntimeEstimate[]> => {
  if (typeof window === "undefined") {
    return {
      "bot-1": [],
      "bot-2": [],
      "bot-3": [],
      "bot-4": [],
    };
  }

  try {
    const saved = localStorage.getItem("bot-monitor-downtime");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Failed to load downtime from localStorage:", error);
  }
  return {
    "bot-1": [],
    "bot-2": [],
    "bot-3": [],
    "bot-4": [],
  };
};

export const BotProvider = ({ children }: { children: ReactNode }) => {
  const [bots, setBots] = useState<Bot[]>(getInitialBots);
  const [events, setEvents] = useState<Record<string, Event[]>>(getInitialEvents);
  const [downtime, setDowntime] = useState<Record<string, DowntimeEstimate[]>>(getInitialDowntime);

  // Persist bots to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bot-monitor-bots", JSON.stringify(bots));
    } catch (error) {
      console.error("Failed to save bots to localStorage:", error);
    }
  }, [bots]);

  // Persist events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bot-monitor-events", JSON.stringify(events));
    } catch (error) {
      console.error("Failed to save events to localStorage:", error);
    }
  }, [events]);

  // Persist downtime to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bot-monitor-downtime", JSON.stringify(downtime));
    } catch (error) {
      console.error("Failed to save downtime to localStorage:", error);
    }
  }, [downtime]);

  const updateBotStatus = (botId: string, newStatus: BotStatus) => {
    const bot = bots.find((b) => b.id === botId);
    if (!bot) return;

    const oldStatus = bot.status;
    const timestamp = `${TODAY} ${CURRENT_TIME}`;

    // Update bot status
    setBots(
      bots.map((b) =>
        b.id === botId ? { ...b, status: newStatus, lastUpdate: timestamp } : b,
      ),
    );

    // Add event for status change
    const newEvent: Event = {
      id: `event-${Date.now()}`,
      timestamp,
      type: "status_change",
      message: `Status changed to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      details: `Changed from ${oldStatus} to ${newStatus}`,
    };

    setEvents({
      ...events,
      [botId]: [newEvent, ...(events[botId] || [])],
    });

    // If bot goes offline, add a downtime estimate
    if (newStatus === "offline" && oldStatus !== "offline") {
      const today = new Date(TODAY);
      const existingDowntimes = downtime[botId] || [];
      const existingToday = existingDowntimes.find((d) => d.date === TODAY);

      if (existingToday) {
        // Update existing downtime for today
        setDowntime({
          ...downtime,
          [botId]: existingDowntimes.map((d) =>
            d.date === TODAY
              ? {
                  ...d,
                  incidents: d.incidents + 1,
                  severity: d.incidents + 1 >= 3 ? "high" : "medium",
                }
              : d,
          ),
        });
      } else {
        // Create new downtime entry for today
        const newDowntimeEntry: DowntimeEstimate = {
          date: TODAY,
          incidents: 1,
          totalDowntime: 0,
          affectedServices: ["Unknown Service"],
          severity: "low",
        };

        setDowntime({
          ...downtime,
          [botId]: [newDowntimeEntry, ...(downtime[botId] || [])],
        });
      }
    }
  };

  return (
    <BotContext.Provider value={{ bots, events, downtime, updateBotStatus }}>
      {children}
    </BotContext.Provider>
  );
};

export const useBotContext = () => {
  const context = useContext(BotContext);
  if (context === undefined) {
    throw new Error("useBotContext must be used within BotProvider");
  }
  return context;
};
