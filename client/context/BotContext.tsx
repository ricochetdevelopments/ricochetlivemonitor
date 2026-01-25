import { createContext, useContext, useState, ReactNode } from "react";

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
    name: "Discord Bot",
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
    name: "Processing Worker",
    status: "restarting",
    lastUpdate: `${TODAY} ${CURRENT_TIME}`,
    uptime: 92.1,
  },
];

export const BotProvider = ({ children }: { children: ReactNode }) => {
  const [bots, setBots] = useState<Bot[]>(INITIAL_BOTS);
  const [events, setEvents] = useState<Record<string, Event[]>>({
    "bot-1": [],
    "bot-2": [],
    "bot-3": [],
    "bot-4": [],
  });
  const [downtime, setDowntime] = useState<Record<string, DowntimeEstimate[]>>({
    "bot-1": [],
    "bot-2": [],
    "bot-3": [],
    "bot-4": [],
  });

  const updateBotStatus = (botId: string, newStatus: BotStatus) => {
    const bot = bots.find((b) => b.id === botId);
    if (!bot) return;

    const oldStatus = bot.status;
    const timestamp = `${TODAY} ${CURRENT_TIME}`;

    // Update bot status
    setBots(
      bots.map((b) =>
        b.id === botId ? { ...b, status: newStatus, lastUpdate: timestamp } : b
      )
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
              : d
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
