import { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Play, Pause, Mic } from "lucide-react";
import { type AppInterface, quickActivityOrder } from "../appsContextApi";
import { useLocalizedApps } from "../hooks/useLocalizedApps";
import { useLanguage } from "../contexts/LanguageContext";

interface ChatMessageProps {
  id: string;
  type: "message" | "app-buttons" | "audio";
  content: string;
  timestamp: string;
  isUser: boolean;
  nodeId?: string;
  appsTypes?: "activities" | "games";
  audioDuration?: number;
  onAppLaunch?: (appToLaunch: AppInterface | undefined) => void;
  onAudioPlay?: (messageId: string) => void;
}

export function ChatMessage({
  id,
  type,
  content,
  timestamp,
  isUser,
  nodeId,
  appsTypes,
  audioDuration = 0,
  onAppLaunch,
  onAudioPlay,
}: ChatMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const apps = useLocalizedApps();
  const { currentLocale } = useLanguage();
  const isRTL = currentLocale === "he";
  const alignRight = isUser;

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAudioPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    setIsPlaying(true);
    onAudioPlay?.(id);

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 0.1;
      setCurrentTime(elapsed);

      if (elapsed >= audioDuration) {
        setIsPlaying(false);
        setCurrentTime(0);
        clearInterval(interval);
      }
    }, 100);
  };

  return (
    <div
      className={`flex ${alignRight ? "justify-end" : "justify-start"} mb-4`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className={`flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[75%] md:max-w-[280px] ${alignRight ? "flex-row-reverse" : "flex-row"}`}
      >
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0">
          <AvatarImage src={isUser ? undefined : "/api/placeholder/32/32"} />
          <AvatarFallback
            className={isUser ? "bg-primary text-primary-foreground text-xs" : "bg-muted text-xs"}
          >
            {isUser ? "U" : "AI"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0">
          <div
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
              isUser
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-muted-foreground rounded-bl-sm"
            }`}
          >
            {type === "audio" ? (
              <>
                <div className="flex items-center gap-3">
                  <Mic className="w-4 h-4 opacity-70" />
                  <span className="text-sm opacity-90">{content}</span>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 rounded-full ${
                      isUser
                        ? "hover:bg-primary-foreground/10 text-primary-foreground"
                        : "hover:bg-muted-foreground/10 text-muted-foreground"
                    }`}
                    onClick={handleAudioPlay}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>

                  <div className="flex-1">
                    <div
                      className={`h-1 rounded-full ${
                        isUser ? "bg-primary-foreground/20" : "bg-muted-foreground/20"
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-100 ${
                          isUser ? "bg-primary-foreground/60" : "bg-muted-foreground/60"
                        }`}
                        style={{
                          width: `${(currentTime / audioDuration) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <span
                    className={`text-xs ${
                      isUser ? "text-primary-foreground/70" : "text-muted-foreground/70"
                    }`}
                  >
                    {isPlaying ? formatAudioTime(currentTime) : formatAudioTime(audioDuration)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm leading-relaxed mb-3">{content}</p>
            )}

            {type === "app-buttons" && (
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                {(appsTypes === "activities"
                  ? quickActivityOrder.map((name) => apps.find((app) => app.name === name))
                  : apps.filter((app) => (appsTypes ? app.type === appsTypes : true))
                )
                  .filter((app): app is AppInterface => Boolean(app))
                  .map((app) => (
                    <Button
                      key={app.name}
                      onClick={() => onAppLaunch?.(app)}
                      className="bg-indigo-500 text-white border-0 rounded-xl p-3 min-h-[60px] h-auto flex flex-col items-center justify-center gap-1 transition-all duration-200 hover:scale-105 active:scale-95 text-xs sm:text-sm"
                      size="sm"
                    >
                      <div className="scale-110">{app.icon}</div>
                      <span className="leading-tight text-center">{app.label}</span>
                    </Button>
                  ))}
              </div>
            )}
          </div>

          <span
            className={`text-xs text-muted-foreground mt-1 ${alignRight ? "text-right" : "text-left"}`}
          >
            {nodeId != null ? `${nodeId} • ${formatTime(timestamp)}` : formatTime(timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
