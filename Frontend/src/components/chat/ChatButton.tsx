import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow } from "./ChatWindow";

interface ChatButtonProps {
  apiKey: string;
}

export const ChatButton = ({ apiKey }: ChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(true); // Set to true by default to open on page load

  // Reset chat session when component mounts (page loads)
  useEffect(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 h-12 w-12 rounded-full bg-[#99B898] hover:bg-[#7a9479] text-white shadow-lg z-50 ${
          isOpen ? 'hidden' : 'block'
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} apiKey={apiKey} />
    </>
  );
};