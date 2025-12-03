import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VoiceInput } from "@/components/VoiceInput";
import { TextInput } from "@/components/TextInput";
import { AIResponse } from "@/components/AIResponse";
import { TaskColumn } from "@/components/TaskColumn";
import { PersonalitySelector } from "@/components/PersonalitySelector";
import { VirtualPet } from "@/components/VirtualPet";
import { Task } from "@/components/TaskCard";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

type Personality = "zen" | "friend" | "coach";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [personality, setPersonality] = useState<Personality>("friend");
  const [completedTasks, setCompletedTasks] = useState(0);
  const { toast } = useToast();

  // Calculate pet state based on task completion
  const petHappiness = Math.min(100, (completedTasks * 10) + 50);
  const petState: "idle" | "happy" | "sleeping" = completedTasks > 0 ? "happy" : "idle";

  // Simple AI task processing (mock - replace with actual API call)
  const processInput = useCallback(async (input: string) => {
    setIsProcessing(true);
    setAiResponse(""); // Clear previous response to show thinking state

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple keyword-based task extraction and categorization
    const lowerInput = input.toLowerCase();
    const urgencyKeywords = ["urgent", "asap", "deadline", "today", "now", "important", "boss", "meeting"];
    const laterKeywords = ["tomorrow", "later", "next week", "when i have time"];
    const optionalKeywords = ["maybe", "if possible", "optional", "if i can", "if time"];

    // Extract tasks (simple split by commas, "and", etc.)
    const taskPhrases = input
      .split(/[,;]|and|then/)
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newTasks: Task[] = [];
    let responseMessage = "";

    taskPhrases.forEach((phrase, index) => {
      const lowerPhrase = phrase.toLowerCase();
      let category: "do-now" | "do-later" | "optional" = "do-later";

      if (urgencyKeywords.some(keyword => lowerPhrase.includes(keyword))) {
        category = "do-now";
      } else if (optionalKeywords.some(keyword => lowerPhrase.includes(keyword))) {
        category = "optional";
      } else if (laterKeywords.some(keyword => lowerPhrase.includes(keyword))) {
        category = "do-later";
      } else if (index === 0) {
        // First task is often most important
        category = "do-now";
      }

      newTasks.push({
        id: `task-${Date.now()}-${index}`,
        title: phrase,
        category,
        completed: false,
      });
    });

    // If no tasks extracted, create one from the whole input
    if (newTasks.length === 0) {
      newTasks.push({
        id: `task-${Date.now()}`,
        title: input,
        category: "do-later",
        completed: false,
      });
    }

    // Generate AI response based on personality
    const personalityResponses = {
      zen: [
        "I've organized your tasks mindfully. Let's approach these one at a time, with presence and calm.",
        "Your tasks are now organized. Remember, each moment is an opportunity for mindful action.",
        "I've sorted your tasks. Take a breath, and let's begin with what needs your attention now.",
      ],
      friend: [
        "Great job getting this down! I've organized your tasks - let's tackle these together! 💪",
        "You're doing amazing! I've sorted everything out. We've got this! ✨",
        "Nice! I've organized your tasks. Let's take them one step at a time - you've got this! 🌟",
      ],
      coach: [
        "Excellent! I've prioritized your tasks. Time to execute and make progress! 🚀",
        "Tasks organized! Let's focus on the 'Do Now' items first - that's where the wins happen! 💪",
        "Perfect! I've set up your action plan. Let's crush these tasks one by one! 🔥",
      ],
    };

    const responses = personalityResponses[personality];
    responseMessage = responses[Math.floor(Math.random() * responses.length)];

    // Check for overwhelm (too many "Do Now" tasks)
    const doNowCount = newTasks.filter(t => t.category === "do-now").length;
    if (doNowCount > 3) {
      responseMessage += " I notice you have quite a few urgent tasks. Would you like me to help prioritize the top 3?";
    }

    setTasks(prev => [...prev, ...newTasks]);
    setAiResponse(responseMessage);
    setIsProcessing(false);

    toast({
      title: "Tasks added!",
      description: `Added ${newTasks.length} task${newTasks.length > 1 ? 's' : ''} to your list.`,
    });
  }, [personality, toast]);

  const handleCompleteTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      setCompletedTasks(prev => prev + 1);
      
      // Confetti celebration!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      toast({
        title: "Task completed! 🎉",
        description: "Great job! Keep up the momentum!",
      });
    } else if (task && task.completed) {
      setCompletedTasks(prev => Math.max(0, prev - 1));
    }
  }, [tasks, toast]);

  const handleDismissTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task?.completed) {
      setCompletedTasks(prev => Math.max(0, prev - 1));
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  }, [tasks]);

  const doNowTasks = tasks.filter(t => t.category === "do-now" && !t.completed);
  const doLaterTasks = tasks.filter(t => t.category === "do-later" && !t.completed);
  const optionalTasks = tasks.filter(t => t.category === "optional" && !t.completed);
  const totalTasks = tasks.length;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 animate-gradient-shift" />
      
      {/* Floating orbs for depth */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float -z-10" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: "2s" }} />
      
      <Header />
      
      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl relative z-10">
        {/* Personality Selector */}
        <div className="mb-8 animate-fade-in">
          <PersonalitySelector selected={personality} onSelect={setPersonality} />
        </div>

        {/* Voice Input Section */}
        <section className="mb-12 flex flex-col items-center animate-fade-in" style={{ animationDelay: "100ms" }}>
          <VoiceInput 
            onTranscript={processInput} 
            isProcessing={isProcessing}
          />
          
          <div className="mt-6">
            <TextInput onSubmit={processInput} />
          </div>

          {/* Show AI response or thinking state */}
          <div className="mt-6 w-full flex justify-center">
            <AIResponse 
              message={aiResponse} 
              personality={personality}
              isProcessing={isProcessing && !aiResponse}
            />
          </div>
        </section>

        {/* Task Board */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex flex-col lg:flex-row gap-6 justify-center">
            <TaskColumn
              title="Do Now"
              category="do-now"
              tasks={doNowTasks}
              maxTasks={3}
              onCompleteTask={handleCompleteTask}
              onDismissTask={handleDismissTask}
            />
            <TaskColumn
              title="Do Later"
              category="do-later"
              tasks={doLaterTasks}
              maxTasks={5}
              onCompleteTask={handleCompleteTask}
              onDismissTask={handleDismissTask}
            />
            <TaskColumn
              title="Optional"
              category="optional"
              tasks={optionalTasks}
              onCompleteTask={handleCompleteTask}
              onDismissTask={handleDismissTask}
            />
          </div>
        </section>
      </main>

      <Footer completedTasks={completedTasks} totalTasks={totalTasks} />
      <VirtualPet state={petState} happiness={petHappiness} />
    </div>
  );
}

