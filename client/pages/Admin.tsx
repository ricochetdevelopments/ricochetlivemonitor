import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, CheckCircle, AlertCircle, Globe } from "lucide-react";
import { useBotContext, BotStatus } from "@/context/BotContext";
import type { Visitor } from "@shared/api";

const ADMIN_CODE = "032374";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"bots" | "visitors">("bots");
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const { bots, updateBotStatus } = useBotContext();

  // Fetch visitors when tab changes
  useEffect(() => {
    if (isAuthenticated && activeTab === "visitors") {
      const fetchVisitors = async () => {
        setLoadingVisitors(true);
        try {
          const response = await fetch("/api/visitors");
          const data = await response.json();
          setVisitors(data.visitors);
        } catch (error) {
          console.error("Failed to fetch visitors:", error);
        } finally {
          setLoadingVisitors(false);
        }
      };

      fetchVisitors();
    }
  }, [isAuthenticated, activeTab]);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code === ADMIN_CODE) {
      setIsAuthenticated(true);
      setCode("");
    } else {
      setError("Invalid code. Please try again.");
      setCode("");
    }
  };

  const changeStatus = (botId: string, newStatus: BotStatus) => {
    updateBotStatus(botId, newStatus);
  };

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Access
            </h1>
            <p className="text-muted-foreground">
              Enter the code to access admin controls
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCodeSubmit} className="space-y-4 mb-6">
            <div>
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="Enter access code"
                className="w-full px-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors"
            >
              Access Admin Panel
            </button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Admin Panel
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bot status control
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-sm font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="mb-8 flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-400">
            You are logged in as admin. You can now change bot statuses.
          </p>
        </div>

        {/* Bot Controls */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Bot Status Control
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <div
                key={bot.id}
                className="bg-card rounded-lg border border-border overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`h-1 w-full ${getStatusColor(bot.status)}`} />

                <div className="p-6">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {bot.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(bot.status)}`}
                      />
                      <span className="text-sm text-muted-foreground capitalize">
                        Current: {bot.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => changeStatus(bot.id, "online")}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bot.status === "online"
                          ? "bg-green-500 text-white"
                          : "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                      }`}
                    >
                      Set Online
                    </button>
                    <button
                      onClick={() => changeStatus(bot.id, "offline")}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bot.status === "offline"
                          ? "bg-red-500 text-white"
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                      }`}
                    >
                      Set Offline
                    </button>
                    <button
                      onClick={() => changeStatus(bot.id, "restarting")}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bot.status === "restarting"
                          ? "bg-amber-500 text-white"
                          : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                      }`}
                    >
                      Set Restarting
                    </button>
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
