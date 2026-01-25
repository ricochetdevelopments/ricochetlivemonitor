import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingDown, AlertTriangle } from "lucide-react";
import { useBotContext } from "@/context/BotContext";

export default function Downtime() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("bot") || "bot-1";
  const { bots, downtime } = useBotContext();
  const bot = bots.find((b) => b.id === botId);
  const botName = bot?.name || "Unknown Bot";
  const downtimes = downtime[botId] || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const totalDowntime = downtimes.reduce(
    (sum, item) => sum + item.totalDowntime,
    0
  );
  const totalIncidents = downtimes.reduce(
    (sum, item) => sum + item.incidents,
    0
  );
  const avgDowntimePerIncident =
    totalIncidents > 0 ? (totalDowntime / totalIncidents).toFixed(1) : 0;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Downtime Estimates
              </h1>
              <p className="text-sm text-muted-foreground">{botName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Total Downtime</p>
              <TrendingDown className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {formatDuration(totalDowntime)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Last 5 days
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Total Incidents</p>
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {totalIncidents}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Recorded events
            </p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">Avg. Duration</p>
              <TrendingDown className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {avgDowntimePerIncident}m
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Per incident
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Daily Breakdown
          </h2>
          <div className="space-y-4">
            {downtimes.map((item) => (
              <div key={item.date} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.incidents} incident{item.incidents !== 1 ? "s" : ""}
                      {item.totalDowntime > 0 &&
                        ` • ${formatDuration(item.totalDowntime)} downtime`}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getSeverityColor(item.severity)}`}
                  >
                    {item.severity}
                  </span>
                </div>

                {/* Affected Services */}
                {item.affectedServices.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <p className="text-xs text-muted-foreground mb-3">
                      Affected Services
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.affectedServices.map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1 rounded-full text-xs bg-muted text-foreground"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {item.totalDowntime > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">
                        Availability
                      </p>
                      <p className="text-xs font-semibold text-foreground">
                        {(100 - (item.totalDowntime / (24 * 60)) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all"
                        style={{
                          width: `${100 - (item.totalDowntime / (24 * 60)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
