import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

const encouragements = [
  "You're doing amazing! 🌟",
  "Keep up the great work!",
  "Progress over perfection 💪",
  "One step at a time!",
  "You've got this! ✨",
  "Small wins lead to big success!",
  "Proud of your progress! 🎉"
];

interface FooterProps {
  completedTasks: number;
  totalTasks: number;
}

export function Footer({ completedTasks, totalTasks }: FooterProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % encouragements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <footer className="glass mt-auto py-6 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground transition-all duration-500">
            {encouragements[messageIndex]}
          </p>
          <p className="text-sm font-medium" data-testid="text-task-count">
            You've completed {completedTasks} task{completedTasks !== 1 ? 's' : ''} today! 🎉
          </p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </footer>
  );
}
