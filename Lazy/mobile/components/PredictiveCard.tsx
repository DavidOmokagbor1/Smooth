/**
 * Predictive Card Component
 * Shows smart predictions based on user patterns
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';

interface PredictiveCardProps {
  tasks: Task[];
  completedToday: number;
  currentTime?: Date;
  onSuggestionPress?: (suggestion: string) => void;
}

interface Prediction {
  type: 'time' | 'pattern' | 'energy' | 'location';
  title: string;
  message: string;
  icon: string;
  color: string;
  suggestion?: string;
  confidence: number;
}

export function PredictiveCard({
  tasks,
  completedToday,
  currentTime = new Date(),
  onSuggestionPress,
}: PredictiveCardProps) {
  const predictions = generatePredictions(tasks, completedToday, currentTime);

  if (predictions.length === 0) return null;

  // Show the highest confidence prediction
  const bestPrediction = predictions.sort((a, b) => b.confidence - a.confidence)[0];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E293B', '#1A1F3A']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="sparkles" size={20} color="#A78BFA" />
            <Text style={styles.title}>Smart Suggestion</Text>
          </View>
          <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(bestPrediction.confidence) + '20' }]}>
            <Text style={[styles.confidenceText, { color: getConfidenceColor(bestPrediction.confidence) }]}>
              {Math.round(bestPrediction.confidence * 100)}% match
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: bestPrediction.color + '20' }]}>
              <Ionicons name={bestPrediction.icon as any} size={24} color={bestPrediction.color} />
            </View>
          </View>

          <Text style={styles.message}>{bestPrediction.message}</Text>

          {bestPrediction.suggestion && (
            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => onSuggestionPress?.(bestPrediction.suggestion!)}
              activeOpacity={0.8}
            >
              <Text style={styles.suggestionButtonText}>{bestPrediction.suggestion}</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

function generatePredictions(
  tasks: Task[],
  completedToday: number,
  currentTime: Date
): Prediction[] {
  const predictions: Prediction[] = [];
  const hour = currentTime.getHours();

  // Time-based predictions
  if (hour >= 9 && hour <= 11) {
    predictions.push({
      type: 'time',
      title: 'Morning Energy',
      message: "You're usually most productive in the morning. Good time to tackle important tasks!",
      icon: 'sunny',
      color: '#F59E0B',
      suggestion: 'Focus on high-priority tasks now',
      confidence: 0.75,
    });
  }

  if (hour >= 14 && hour <= 16) {
    predictions.push({
      type: 'time',
      title: 'Afternoon Focus',
      message: "Afternoon is great for completing medium-priority tasks. You've got momentum!",
      icon: 'time',
      color: '#3B82F6',
      suggestion: 'Tackle medium-priority tasks',
      confidence: 0.70,
    });
  }

  // Pattern-based predictions
  if (completedToday >= 3 && tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length > 0) {
    predictions.push({
      type: 'pattern',
      title: 'High Productivity',
      message: "You're on a roll! You usually complete urgent tasks when you're this productive.",
      icon: 'flash',
      color: '#10B981',
      suggestion: 'Focus on urgent tasks while you have momentum',
      confidence: 0.80,
    });
  }

  // Energy-based predictions
  if (completedToday === 0 && tasks.length > 0) {
    predictions.push({
      type: 'energy',
      title: 'Fresh Start',
      message: "Starting your day? Begin with the easiest task to build momentum!",
      icon: 'play-circle',
      color: '#7C3AED',
      suggestion: 'Start with a quick win',
      confidence: 0.65,
    });
  }

  // Location-based predictions
  const locationTasks = tasks.filter(t => t.category?.location);
  if (locationTasks.length >= 2) {
    predictions.push({
      type: 'location',
      title: 'Batch Your Errands',
      message: `You have ${locationTasks.length} location-based tasks. Group them together to save time!`,
      icon: 'location',
      color: '#EC4899',
      suggestion: 'Plan your route for errands',
      confidence: 0.85,
    });
  }

  // Calendar integration suggestions
  const appointmentTasks = tasks.filter(t => t.category?.type === 'appointment' || t.due_date);
  if (appointmentTasks.length > 0 && !appointmentTasks.some(t => t.reminder_time)) {
    predictions.push({
      type: 'time',
      title: 'Calendar Integration',
      message: `You have ${appointmentTasks.length} appointment${appointmentTasks.length > 1 ? 's' : ''}. Add them to your calendar for better organization!`,
      icon: 'calendar',
      color: '#3B82F6',
      suggestion: 'Add appointments to calendar',
      confidence: 0.80,
    });
  }

  // Contact integration suggestions
  const callTasks = tasks.filter(t => 
    t.title.toLowerCase().includes('call') || 
    t.title.toLowerCase().includes('phone') ||
    t.category?.type === 'appointment'
  );
  if (callTasks.length > 0) {
    predictions.push({
      type: 'pattern',
      title: 'Link Contacts',
      message: `Some tasks involve calling people. Link contacts to make calling easier!`,
      icon: 'person-add',
      color: '#10B981',
      suggestion: 'Link contacts to tasks',
      confidence: 0.75,
    });
  }

  // Completion-based predictions
  if (tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length === 0 && tasks.length > 0) {
    predictions.push({
      type: 'pattern',
      title: 'All Caught Up',
      message: "No urgent tasks! Great time to work on personal projects or self-care.",
      icon: 'checkmark-done-circle',
      color: '#10B981',
      suggestion: 'Focus on optional tasks or rest',
      confidence: 0.90,
    });
  }

  // Streak-based predictions
  if (completedToday >= 5) {
    predictions.push({
      type: 'pattern',
      title: 'Power Day',
      message: "You've completed 5+ tasks today! You're in a flow state - keep going!",
      icon: 'rocket',
      color: '#EF4444',
      suggestion: 'Maintain your momentum',
      confidence: 0.75,
    });
  }

  return predictions;
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return '#10B981';
  if (confidence >= 0.6) return '#F59E0B';
  return '#64748B';
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 15,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },
  suggestionButton: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  suggestionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

