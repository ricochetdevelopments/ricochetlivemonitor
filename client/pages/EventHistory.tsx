import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { useBotContext } from "@/context/BotContext";

export default function EventHistory() {
  const [searchParams] = useSearchParams();
  const botId = searchParams.get("bot") || "bot-1";
  const { bots, events } = useBotContext();
  const bot = bots.find((b) => b.id === botId);
  const botName = bot?.name || "Unknown Bot";
  const botEvents = events[botId] || [];
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = events.filter(
    (event) =>
      event.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventColor = (type: string) => {
    switch (type) {
      case "status_change":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "restart":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "error":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "recovery":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getEventLabel = (type: string) => {
    return type.replace("_", " ").toUpperCase();
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
                Event History
              </h1>
              <p className="text-sm text-muted-foreground">{botName}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Events Timeline */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No events found</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className="relative flex gap-4"
              >
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full ${getEventColor(event.type).split(" ")[0]} border-2 ${getEventColor(event.type).split(" ")[2]}`} />
                  {index < filteredEvents.length - 1 && (
                    <div className="w-1 h-12 bg-border/40 my-2" />
                  )}
                </div>

                {/* Event Card */}
                <div className="flex-1 pb-4">
                  <div className="bg-card rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {event.message}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.timestamp}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getEventColor(event.type)}`}
                      >
                        {getEventLabel(event.type)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.details}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
