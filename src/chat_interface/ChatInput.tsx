import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Mic, Plus } from "lucide-react";
import { m } from "../paraglide/messages.js";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onVoiceInput?: () => void;
  onAddAttachment?: () => void;
}

export function ChatInput({ onSendMessage, onVoiceInput, onAddAttachment }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-11 w-11 min-w-[44px] min-h-[44px] rounded-full flex-shrink-0 p-0"
          onClick={onAddAttachment}
          aria-label={m.chat_addAttachment()}
        >
          <Plus className="w-5 h-5" />
        </Button>

        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            placeholder={m.chat_placeholder()}
            className="pr-12 h-11 rounded-full bg-muted border-0 focus-visible:ring-1 focus-visible:ring-ring text-base"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 min-w-[44px] min-h-[44px] rounded-full p-0"
            onClick={onVoiceInput}
            aria-label={m.chat_voiceInput()}
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        <Button
          type="submit"
          size="sm"
          className="h-11 w-11 min-w-[44px] min-h-[44px] rounded-full flex-shrink-0 p-0"
          disabled={!message.trim()}
          aria-label={m.chat_sendMessage()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
