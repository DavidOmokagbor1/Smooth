import { AudioWaveform, Settings, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <header className="glass sticky top-0 z-50 h-16 px-6 flex items-center justify-between backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20">
          <AudioWaveform className="h-6 w-6 text-primary animate-pulse" />
        </div>
        <h1 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          EASY
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsDark(!isDark)}
          data-testid="button-theme-toggle"
          className="hover-elevate rounded-full"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          data-testid="button-settings"
          className="hover-elevate rounded-full"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all cursor-pointer hover:scale-105" data-testid="avatar-user">
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
