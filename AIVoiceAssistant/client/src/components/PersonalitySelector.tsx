import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flower2, Heart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Personality = "zen" | "friend" | "coach";

interface PersonalitySelectorProps {
  selected: Personality;
  onSelect: (personality: Personality) => void;
}

const personalities = [
  {
    id: "zen" as const,
    name: "Zen Master",
    icon: Flower2,
    color: "text-secondary",
    bgColor: "bg-secondary/10 hover:bg-secondary/20",
    description: "Calm, mindful guidance"
  },
  {
    id: "friend" as const,
    name: "Best Friend",
    icon: Heart,
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20",
    description: "Supportive & encouraging"
  },
  {
    id: "coach" as const,
    name: "Coach",
    icon: Zap,
    color: "text-accent",
    bgColor: "bg-accent/10 hover:bg-accent/20",
    description: "Motivating & energetic"
  }
];

export function PersonalitySelector({ selected, onSelect }: PersonalitySelectorProps) {
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      {personalities.map((personality) => {
        const Icon = personality.icon;
        const isSelected = selected === personality.id;

        return (
          <Card
            key={personality.id}
            className={cn(
              "p-4 cursor-pointer transition-all duration-300",
              "glass hover-elevate active-elevate-2",
              "shadow-md hover:shadow-lg",
              personality.bgColor,
              isSelected && "ring-2 ring-offset-2 scale-105",
              isSelected && personality.color.replace('text-', 'ring-'),
              "hover:scale-105"
            )}
            onClick={() => onSelect(personality.id)}
            data-testid={`button-personality-${personality.id}`}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg transition-all",
                isSelected ? "bg-white/20 shadow-md" : "bg-white/10"
              )}>
                <Icon className={cn("h-6 w-6", personality.color)} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{personality.name}</p>
                <p className="text-xs text-muted-foreground">{personality.description}</p>
              </div>
              {isSelected && (
                <Badge variant="default" className="ml-auto animate-fade-in">Active</Badge>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
