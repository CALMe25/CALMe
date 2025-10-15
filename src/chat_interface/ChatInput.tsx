import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Mic, Plus } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput?: () => void;
  onAddAttachment?: () => void;
}

export function ChatInput({ onSendMessage, onVoiceInput, onAddAttachment }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full flex-shrink-0"
          onClick={onAddAttachment}
        >
          <Plus className="w-5 h-5" />
        </Button>
        
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="pr-12 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={onVoiceInput}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          type="submit"
          size="sm"
          className="h-10 w-10 rounded-full flex-shrink-0"
          disabled={!message.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}