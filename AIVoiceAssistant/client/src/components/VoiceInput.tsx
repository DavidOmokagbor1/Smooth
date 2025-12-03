import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isProcessing?: boolean;
}

export function VoiceInput({ onTranscript, isProcessing = false }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showRipple, setShowRipple] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (transcript.trim()) {
        onTranscript(transcript.trim());
        setTranscript("");
      }
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsListening(true);
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Multiple ripple layers for depth */}
        {showRipple && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-ripple pointer-events-none" style={{ animationDelay: "0ms" }} />
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ripple pointer-events-none" style={{ animationDelay: "300ms" }} />
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ripple pointer-events-none" style={{ animationDelay: "600ms" }} />
          </>
        )}
        {/* Glow effect when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl animate-pulse pointer-events-none -z-10" />
        )}
        <Button
          size="icon"
          variant={isListening ? "default" : "outline"}
          className={cn(
            "h-32 w-32 rounded-full transition-all duration-300 relative",
            "bg-gradient-to-br from-primary to-primary/80",
            "shadow-2xl shadow-primary/30",
            isListening && "animate-pulse-glow scale-105",
            !isListening && "hover:scale-105 hover:shadow-primary/20",
            "border-2 border-primary/20"
          )}
          onClick={toggleListening}
          disabled={isProcessing}
          data-testid="button-voice-toggle"
        >
          {isProcessing ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary-foreground" />
          ) : isListening ? (
            <Mic className="h-12 w-12 text-primary-foreground" />
          ) : (
            <MicOff className="h-12 w-12" />
          )}
        </Button>
      </div>

      {transcript && (
        <div className="glass rounded-2xl p-6 max-w-2xl w-full animate-slide-up shadow-lg">
          <p className="text-lg text-foreground leading-relaxed font-medium">{transcript}</p>
        </div>
      )}

      <p className="text-muted-foreground text-sm font-medium">
        {isListening ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Listening... Click to stop
          </span>
        ) : (
          "Click to start speaking"
        )}
      </p>
    </div>
  );
}
