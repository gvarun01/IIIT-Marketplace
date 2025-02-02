import { cn } from "@/lib/utils";
interface ChatMessageProps {
  message: string;
  isBot: boolean;
  timestamp: Date;
}
export const ChatMessage = ({ message, isBot, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn("flex", isBot ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2 mb-2",
          isBot
            ? "bg-white text-[#2A363B] rounded-tl-none"
            : "bg-[#99B898] text-white rounded-tr-none"
        )}
      >
        <p className="text-sm">{message}</p>
        <p className="text-xs mt-1 opacity-70">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};