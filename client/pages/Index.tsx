import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertCircle, Clock, RefreshCw } from "lucide-react";

interface Bot {
  id: string;
  name: string;
  status: "online" | "offline" | "restarting";
  lastUpdate: string;
  uptime: number;
}

const MOCK_BOTS: Bot[] = [
  {
    id: "bot-1",
    name: "Discord Bot",
    status: "online",
    lastUpdate: "2024-01-20 14:32:00",
    uptime: 98.5,
  },
  {
    id: "bot-2",
    name: "Telegram Bot",
    status: "online",
    lastUpdate: "2024-01-20 14:31:45",
    uptime: 99.2,
  },
  {
    id: "bot-3",
    name: "API Server",
    status: "offline",
    lastUpdate: "2024-01-20 14:00:00",
    uptime: 85.3,
  },
  {
    id: "bot-4",
    name: "Processing Worker",
    status: "restarting",
    lastUpdate: "2024-01-20 14:35:20",
    uptime: 92.1,
  },
];

export default function Index() {
  const [bots, setBots] = useState<Bot[]>(MOCK_BOTS);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "restarting":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500/10";
      case "offline":
        return "bg-red-500/10";
      case "restarting":
        return "bg-amber-500/10";
      default:
        return "bg-gray-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Bot Monitor
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time bot status dashboard
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Overview */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Bot Status Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Total Bots</p>
              <p className="text-3xl font-bold text-foreground">{bots.length}</p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Online</p>
              <p className="text-3xl font-bold text-green-500">
                {bots.filter((b) => b.status === "online").length}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Restarting</p>
              <p className="text-3xl font-bold text-amber-500">
                {bots.filter((b) => b.status === "restarting").length}
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">Offline</p>
              <p className="text-3xl font-bold text-red-500">
                {bots.filter((b) => b.status === "offline").length}
              </p>
            </div>
          </div>
        </div>

        {/* Bots Grid */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">Bots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-card rounded-lg border border-border overflow-hidden hover:border-border/80 transition-colors group"
              >
                {/* Card Header with Status */}
                <div className={`h-1 w-full ${getStatusColor(bot.status)}`} />

                <div className="p-6">
                  {/* Bot Info */}
                  <div className="mb-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {bot.name}
                      </h3>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2 ${getStatusBgColor(bot.status)}`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${getStatusColor(bot.status)} ${
                            bot.status === "restarting" ? "animate-pulse-subtle" : ""
                          }`}
                        />
                        <span className="capitalize text-foreground">
                          {bot.status}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last Update</span>
                        <span className="text-foreground">{bot.lastUpdate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Uptime</span>
                        <span className="text-foreground font-medium">
                          {bot.uptime}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      to={`/event-history?bot=${bot.id}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      History
                    </Link>
                    <Link
                      to={`/downtime?bot=${bot.id}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Downtime
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
