import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface TextInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
}

export function TextInput({ onSubmit, placeholder = "Or type here..." }: TextInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-2 max-w-2xl w-full">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="glass text-base shadow-md focus:shadow-lg transition-shadow"
        data-testid="input-text-task"
      />
      <Button
        onClick={handleSubmit}
        disabled={!text.trim()}
        data-testid="button-send"
        className="shadow-md hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
