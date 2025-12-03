/**
 * Type definitions for the Lazy app
 */

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type Personality = 'zen' | 'friend' | 'coach';

export interface TaskCategory {
  type: string;
  location?: string;
  estimated_duration_minutes?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  original_text: string;
  suggested_time?: string;
  due_date?: string;
  reminder_time?: string;
  location_coordinates?: Record<string, any>;
  status?: TaskStatus;
}

export interface EmotionalState {
  primary_emotion: string;
  energy_level: number;
  stress_level: number;
  confidence: number;
}

export interface CompanionSuggestion {
  message: string;
  suggested_action?: string;
  reasoning: string;
  tone: 'gentle' | 'supportive' | 'energetic' | 'calm';
}

export interface VoiceProcessingResponse {
  transcript: string;
  emotional_state: EmotionalState;
  tasks: Task[];
  companion_suggestion: CompanionSuggestion;
  processing_metadata: Record<string, any>;
}

