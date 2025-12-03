/**
 * Smart Insights Component
 * Shows how the AI is intelligently helping the user
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';

interface SmartInsightsProps {
  tasks: Task[];
  emotionalState?: {
    primary_emotion: string;
    energy_level: number;
    stress_level: number;
  };
}

export function SmartInsights({ tasks, emotionalState }: SmartInsightsProps) {
  if (tasks.length === 0) return null;

  // Calculate insights
  const criticalTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length;
  const totalDuration = tasks.reduce((sum, t) => sum + (t.category?.estimated_duration_minutes || 0), 0);
  const hasLocationTasks = tasks.filter(t => t.category?.location).length;

  // Get smart recommendation
  const getRecommendation = () => {
    if (emotionalState) {
      if (emotionalState.stress_level > 0.7 && emotionalState.energy_level < 0.4) {
        return {
          icon: 'heart-outline' as const,
          message: 'You seem overwhelmed. Focus on just 1-2 tasks today.',
          color: '#EF4444',
        };
      }
      if (criticalTasks > 3) {
        return {
          icon: 'flash' as const,
          message: `${criticalTasks} urgent tasks. Let's tackle the most important first.`,
          color: '#F59E0B',
        };
      }
      if (totalDuration > 120) {
        return {
          icon: 'time-outline' as const,
          message: `About ${Math.round(totalDuration / 60)} hours of tasks. We've prioritized what matters most.`,
          color: '#3B82F6',
        };
      }
    }
    return {
      icon: 'checkmark-circle' as const,
      message: 'Tasks organized by priority. Start with "Do Now" when you\'re ready.',
      color: '#10B981',
    };
  };

  const recommendation = getRecommendation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E293B', '#1A1F3A']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={20} color="#A78BFA" />
          </View>
          <Text style={styles.title}>AI Insights</Text>
        </View>

        <View style={styles.insightRow}>
          <Ionicons name={recommendation.icon} size={18} color={recommendation.color} />
          <Text style={styles.message}>{recommendation.message}</Text>
        </View>

        {hasLocationTasks > 0 && (
          <View style={styles.insightRow}>
            <Ionicons name="location" size={18} color="#3B82F6" />
            <Text style={styles.message}>
              {hasLocationTasks} task{hasLocationTasks > 1 ? 's' : ''} with locations. We can help you plan your route.
            </Text>
          </View>
        )}

        <View style={styles.stats}>
          <StatItem label="Urgent" value={criticalTasks} color="#F59E0B" />
          <StatItem label="Total" value={tasks.length} color="#7C3AED" />
          <StatItem 
            label="Time" 
            value={totalDuration >= 60 ? `${Math.round(totalDuration / 60)}h` : `${totalDuration}m`} 
            color="#3B82F6" 
          />
        </View>
      </LinearGradient>
    </View>
  );
}

function StatItem({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
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
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#E2E8F0',
    flex: 1,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
});

