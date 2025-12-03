import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type PetState = "idle" | "happy" | "sleeping";

interface VirtualPetProps {
  state: PetState;
  happiness: number;
}

export function VirtualPet({ state, happiness }: VirtualPetProps) {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    if (state === "happy") {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const getEmoji = () => {
    if (state === "sleeping") return "😴";
    if (state === "happy") return "🎉";
    if (happiness > 70) return "😊";
    if (happiness > 40) return "🙂";
    return "😐";
  };

  return (
    <div 
      className={cn(
        "fixed bottom-24 right-8 transition-all duration-300",
        state === "idle" && "animate-float",
        bounce && "animate-bounce"
      )}
      data-testid="virtual-pet"
    >
      <div className="relative">
        <div className="text-6xl filter drop-shadow-lg">
          {getEmoji()}
        </div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent rounded-full animate-pulse" />
      </div>
    </div>
  );
}
