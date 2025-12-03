import { Check, X, GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  category: "do-now" | "do-later" | "optional";
  completed?: boolean;
}

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
  isDragging?: boolean;
}

export function TaskCard({ task, onComplete, onDismiss, isDragging = false }: TaskCardProps) {
  const categoryColors = {
    "do-now": "border-l-4 border-l-primary shadow-primary/10",
    "do-later": "border-l-4 border-l-secondary shadow-secondary/10",
    "optional": "border-l-4 border-l-accent shadow-accent/10"
  };

  const categoryGradients = {
    "do-now": "from-primary/5 to-primary/0",
    "do-later": "from-secondary/5 to-secondary/0",
    "optional": "from-accent/5 to-accent/0"
  };

  return (
    <Card
      className={cn(
        "p-4 hover-elevate active-elevate-2 cursor-move transition-all duration-300",
        "glass shadow-md hover:shadow-lg",
        "bg-gradient-to-r",
        categoryGradients[task.category],
        categoryColors[task.category],
        isDragging && "opacity-50 rotate-2 scale-95",
        task.completed && "opacity-60",
        "animate-slide-up"
      )}
      data-testid={`card-task-${task.id}`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition-opacity" />
        
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onComplete(task.id)}
          className="mt-0.5"
          data-testid={`checkbox-task-${task.id}`}
        />

        <p className={cn(
          "flex-1 text-base leading-relaxed font-medium",
          task.completed && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={() => onDismiss(task.id)}
          data-testid={`button-dismiss-${task.id}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
