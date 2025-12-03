import { Card } from "@/components/ui/card";
import { TaskCard, Task } from "./TaskCard";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  title: string;
  category: "do-now" | "do-later" | "optional";
  tasks: Task[];
  maxTasks?: number;
  onCompleteTask: (id: string) => void;
  onDismissTask: (id: string) => void;
}

export function TaskColumn({ 
  title, 
  category, 
  tasks, 
  maxTasks,
  onCompleteTask,
  onDismissTask 
}: TaskColumnProps) {
  const icons = {
    "do-now": CheckCircle2,
    "do-later": Clock,
    "optional": Sparkles
  };

  const colors = {
    "do-now": "text-primary",
    "do-later": "text-secondary",
    "optional": "text-accent"
  };

  const Icon = icons[category];
  const isOverLimit = maxTasks && tasks.length > maxTasks;

  const categoryBgGradients = {
    "do-now": "from-primary/5 via-primary/2 to-transparent",
    "do-later": "from-secondary/5 via-secondary/2 to-transparent",
    "optional": "from-accent/5 via-accent/2 to-transparent"
  };

  return (
    <div className="flex flex-col gap-4 min-w-[320px]">
      <div className="flex items-center justify-between glass rounded-xl p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg bg-gradient-to-br",
            categoryBgGradients[category]
          )}>
            <Icon className={cn("h-5 w-5", colors[category])} />
          </div>
          <h3 className="text-lg font-heading font-semibold">{title}</h3>
        </div>
        <div className={cn(
          "text-sm px-3 py-1 rounded-full font-medium transition-all",
          isOverLimit 
            ? "bg-destructive/20 text-destructive border border-destructive/30" 
            : "bg-muted/50 text-muted-foreground border border-border"
        )}>
          {tasks.length}{maxTasks ? `/${maxTasks}` : ''}
        </div>
      </div>

      <div className="flex flex-col gap-3 min-h-[200px]">
        {tasks.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed glass">
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1 opacity-60">Add tasks using voice or text</p>
          </Card>
        ) : (
          tasks.map((task, index) => (
            <div 
              key={task.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-fade-in"
            >
              <TaskCard
                task={task}
                onComplete={onCompleteTask}
                onDismiss={onDismissTask}
              />
            </div>
          ))
        )}
      </div>

      {isOverLimit && (
        <div className="glass rounded-lg p-3 border border-destructive/20 bg-destructive/5 animate-fade-in">
          <p className="text-sm text-destructive font-medium">
            ⚠️ Consider moving some tasks to Do Later
          </p>
        </div>
      )}
    </div>
  );
}
