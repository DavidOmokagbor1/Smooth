import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Trophy, Star, Zap } from "lucide-react";

interface GamificationPanelProps {
  xp: number;
  level: number;
  streak: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  icon: "trophy" | "star" | "zap";
  unlocked: boolean;
}

export function GamificationPanel({ xp, level, streak, achievements }: GamificationPanelProps) {
  const xpForNextLevel = level * 100;
  const progress = (xp / xpForNextLevel) * 100;

  const iconMap = {
    trophy: Trophy,
    star: Star,
    zap: Zap
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-6 glass">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-3xl font-heading font-bold text-primary">{level}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">XP</p>
            <p className="text-lg font-semibold">{xp} / {xpForNextLevel}</p>
          </div>
        </div>
        <Progress value={progress} className="h-3" />
      </Card>

      <Card className="p-6 glass">
        <div className="flex items-center gap-3">
          <Flame className="h-8 w-8 text-accent" />
          <div>
            <p className="text-sm text-muted-foreground">Daily Streak</p>
            <p className="text-3xl font-heading font-bold text-accent">{streak}</p>
          </div>
          <Badge variant="default" className="ml-auto">
            {streak > 0 ? '🔥 On Fire!' : 'Start Today!'}
          </Badge>
        </div>
      </Card>

      <Card className="p-6 glass md:col-span-2">
        <h3 className="text-lg font-heading font-semibold mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {achievements.map((achievement) => {
            const Icon = iconMap[achievement.icon];
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg text-center transition-all ${
                  achievement.unlocked 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted/30 text-muted-foreground opacity-50'
                }`}
                data-testid={`achievement-${achievement.id}`}
              >
                <Icon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs font-medium">{achievement.name}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
