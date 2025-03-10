import { useState, useRef, useEffect } from "react";
import { X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./ChatMessage";
import { Card } from "@/components/ui/card";

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
}

export const ChatWindow = ({ isOpen, onClose, apiKey }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! Welcome to IIIT Buy-Sell support. How can I help you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // In your getRAGResponse function, modify to try multiple ports
const getRAGResponse = async (userInput: string) => {
  // Ports to try in order
  const ports = [5001, 5002, 5003, 3001, 3002, 8080];
  
  // Store the successful port for future use
  const successPort = localStorage.getItem('ragServicePort') || null;
  
  // If we have a previously successful port, try it first
  if (successPort) {
    ports.unshift(parseInt(successPort, 10));
  }
  
  // Try each port until one works
  for (const port of ports) {
    try {
      const conversationHistory = messages
        .slice(1) // Skip the welcome message
        .map((m) => (m.isBot ? "Assistant: " : "User: ") + m.text)
        .join("\n");

      const response = await fetch(`http://localhost:${port}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userInput,
          conversationHistory: conversationHistory,
          apiKey: apiKey
        }),
        // Short timeout to quickly try the next port
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        // Store successful port for future use
        localStorage.setItem('ragServicePort', port.toString());
        const data = await response.json();
        return data.response;
      }
    } catch (error) {
      console.log(`Failed to connect to RAG service on port ${port}`);
      // Continue to next port
    }
  }
  
  // If all ports fail, fall back to Gemini API
  console.error("Error calling RAG service: All ports failed");
  return fallbackToGemini(userInput);
};

  const fallbackToGemini = async (userInput: string) => {
    try {
      const conversationContext = messages
        .slice(1) // Skip the welcome message
        .map((m) => (m.isBot ? "Assistant: " : "User: ") + m.text)
        .join("\n");
        
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
          apiKey,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a helpful customer support assistant for IIIT Buy-Sell website. 
                    Previous conversation context: ${conversationContext}
                    User: ${userInput}
                    
                    Respond in a helpful and friendly manner, keeping in mind the context of our IIIT Buy-Sell platform.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response from Gemini API');
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error in fallback to Gemini API:", error);
      return "I apologize, but I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      text: input.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const response = await getRAGResponse(input.trim());
    
    setMessages((prev) => [
      ...prev,
      {
        text: response,
        isBot: true,
        timestamp: new Date(),
      },
    ]);
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-[380px] h-[600px] flex flex-col shadow-xl border border-[#E8B4A2]/20 z-50">
      <div className="flex items-center justify-between p-4 border-b border-[#E8B4A2]/20">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-[#99B898]" />
          <h3 className="font-semibold text-[#2A363B]">IIIT Buy-Sell Support</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#2A363B]"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-[#FDF8F3]">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message.text} isBot={message.isBot} timestamp={message.timestamp} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-[#E8B4A2]/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            className="bg-[#99B898] hover:bg-[#7a9479] text-white"
            disabled={isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};