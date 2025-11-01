import { useContext, useState } from 'react';
import { Button } from "./ui/button";

import { Play, Pause, Mic } from "lucide-react";
import { AppsContext, type AppInterface } from '../appsContextApi';

interface ChatMessageProps {
  id: string;
  type: 'message' | 'app-buttons' | 'audio';
  content: string;
  timestamp: string;
  isUser: boolean;
  appsTypes?: 'activities' | 'games';
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
  appsTypes,
  audioDuration = 0,
  onAppLaunch,
  onAudioPlay
}: ChatMessageProps) {
  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Context
  const apps = useContext(AppsContext);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioPlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentTime(0);
    } else {
      setIsPlaying(true);
      onAudioPlay?.(id);
      
      // Simulate audio playback
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
    }
  };


return (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 `}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* This is Same all Messages */}
          {/* <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={isUser ? undefined : "/api/placeholder/32/32"} />
            <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
              {isUser ? "U" : "AI"}
            </AvatarFallback>
          </Avatar> */}
          
          
          <div className="flex flex-col">
            <div className={`px-4 py-3 rounded-2xl ${
              isUser 
                ? 'bg-primary text-primary-foreground rounded-br-sm' 
                : 'bg-muted text-muted-foreground rounded-bl-sm'
            }`}>

              {/* This is for audio type message only
               if audio input was made, this can be for both ends user and AI */}
              {(type === 'audio')&&
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
                      ? 'hover:bg-primary-foreground/10 text-primary-foreground' 
                      : 'hover:bg-muted-foreground/10 text-muted-foreground'
                  }`}
                  onClick={handleAudioPlay}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <div className="flex-1">
                  <div className={`h-1 rounded-full ${
                    isUser ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'
                  }`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-100 ${
                        isUser ? 'bg-primary-foreground/60' : 'bg-muted-foreground/60'
                      }`}
                      style={{ width: `${(currentTime / audioDuration) * 100}%` }}
                    />
                  </div>
                </div>
                
                <span className={`text-xs ${
                  isUser ? 'text-primary-foreground/70' : 'text-muted-foreground/70'
                }`}>
                  {isPlaying ? formatAudioTime(currentTime) : formatAudioTime(audioDuration)}
                </span>
              </div>
              </>
              }

              {/* This is a plain message Text */}
              {!(type === 'audio') &&
              <p className="text-sm leading-relaxed mb-3">{content}</p>}
              
              {/*  This is for app-button type: App Icons Grid 
              Check if this message should contain activities or games*/}
              {(type === 'app-buttons' && apps && apps.length > 0) &&
              <div className={`grid ${apps.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-2`}>
                {apps.slice(0, 4).map((app, index) => {
                  // console.log(`button for ${app.name}`)
                  if (app.type == appsTypes){
                    return (
                      <Button
                        key={index}
                        onClick={() => onAppLaunch?.(app)}
                        className={`bg-indigo-500 text-white border-0 rounded-xl p-3 h-auto flex flex-col items-center gap-1 transition-all duration-200 hover:scale-105 text-xs`}
                        size="sm"
                      >

                        {app.icon}
                        <span className="leading-tight">{app.label}</span>
                      </Button>
                  );}
                })}
              </div>}
            
            </div>
            {/* This is TimeStamp for all msgs */}
            <span className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTime(timestamp)}
            </span>
          </div>
        </div>
      </div>
);
}