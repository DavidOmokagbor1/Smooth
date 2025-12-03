import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { FloatingParticles } from "./FloatingParticles";
import { cn } from "@/lib/utils";

interface AIResponseProps {
  message: string;
  personality?: "zen" | "friend" | "coach";
  isProcessing?: boolean;
}

export function AIResponse({ message, personality = "friend", isProcessing = false }: AIResponseProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (!message) {
      setDisplayedText("");
      setIsTyping(false);
      return;
    }
    
    setDisplayedText("");
    setIsTyping(true);
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 20);

    return () => clearInterval(typingInterval);
  }, [message]);

  const personalityColors = {
    zen: "text-secondary",
    friend: "text-primary",
    coach: "text-accent"
  };

  const personalityGradients = {
    zen: "from-blue-500/20 to-cyan-500/20",
    friend: "from-purple-500/20 to-pink-500/20",
    coach: "from-green-500/20 to-emerald-500/20"
  };

  if (isProcessing && !message) {
    return (
      <Card className={cn(
        "glass p-6 max-w-2xl w-full relative overflow-hidden",
        "bg-gradient-to-br",
        personalityGradients[personality]
      )}>
        <FloatingParticles active={true} count={15} />
        <div className="flex items-center gap-3 relative z-10">
          <Sparkles className={cn("h-5 w-5 animate-pulse", personalityColors[personality])} />
          <div className="flex-1">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Thinking...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!message) return null;

  return (
    <Card className={cn(
      "glass p-6 max-w-2xl w-full animate-breathe relative overflow-hidden",
      "bg-gradient-to-br shadow-lg shadow-primary/10",
      personalityGradients[personality]
    )}>
      <div className="flex items-start gap-3 relative z-10">
        <Sparkles className={cn("h-5 w-5 mt-0.5 animate-pulse", personalityColors[personality])} />
        <div className="flex-1">
          <p className="text-base leading-relaxed text-foreground">
            {displayedText}
            {isTyping && <span className="inline-block w-1 h-4 bg-primary ml-1 animate-pulse" />}
          </p>
        </div>
      </div>
    </Card>
  );
}
