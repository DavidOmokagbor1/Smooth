/**
 * Progress Dashboard Component
 * Shows user's progress, stats, and achievements
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';

interface ProgressDashboardProps {
  tasks: Task[];
  completedToday?: number;
  streakDays?: number;
  totalCompleted?: number;
  onClose?: () => void;
}

export function ProgressDashboard({
  tasks,
  completedToday = 0,
  streakDays = 0,
  totalCompleted = 0,
  onClose,
}: ProgressDashboardProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.priority === 'low').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const criticalTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length;
  const completedCritical = tasks.filter(
    t => (t.priority === 'critical' || t.priority === 'high') && 
    (t.status === 'completed' || t.priority === 'low')
  ).length;

  const getStreakEmoji = () => {
    if (streakDays >= 30) return '🔥🔥🔥';
    if (streakDays >= 14) return '🔥🔥';
    if (streakDays >= 7) return '🔥';
    if (streakDays >= 3) return '⭐';
    return '✨';
  };

  const getMotivationalMessage = () => {
    if (completionRate >= 80) return "You're crushing it! Almost there!";
    if (completionRate >= 50) return "Great progress! Keep going!";
    if (completionRate >= 25) return "You're making progress!";
    return "Every step counts! You've got this!";
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E293B', '#1A1F3A']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="stats-chart" size={24} color="#A78BFA" />
            <Text style={styles.title}>Your Progress</Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Streak Section */}
          {streakDays > 0 && (
            <View style={styles.streakCard}>
              <LinearGradient
                colors={['#7C3AED', '#9333EA']}
                style={styles.streakGradient}
              >
                <View style={styles.streakContent}>
                  <Text style={styles.streakEmoji}>{getStreakEmoji()}</Text>
                  <Text style={styles.streakDays}>{streakDays}</Text>
                  <Text style={styles.streakLabel}>
                    {streakDays === 1 ? 'Day' : 'Days'} Streak
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Today's Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            <View style={styles.statsGrid}>
              <StatCard
                icon="checkmark-circle"
                label="Completed"
                value={completedToday}
                color="#10B981"
              />
              <StatCard
                icon="list"
                label="Total Tasks"
                value={totalTasks}
                color="#7C3AED"
              />
              <StatCard
                icon="flash"
                label="Urgent"
                value={criticalTasks}
                color="#F59E0B"
              />
            </View>
          </View>

          {/* Completion Progress */}
          {totalTasks > 0 && (
            <View style={styles.section}>
              <View style={styles.progressHeader}>
                <Text style={styles.sectionTitle}>Completion Rate</Text>
                <Text style={styles.percentage}>{completionRate}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={['#10B981', '#34D399']}
                    style={[styles.progressFill, { width: `${completionRate}%` }]}
                  />
                </View>
              </View>
              <Text style={styles.progressMessage}>{getMotivationalMessage()}</Text>
            </View>
          )}

          {/* All Time Stats */}
          {totalCompleted > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Time</Text>
              <View style={styles.allTimeCard}>
                <Ionicons name="trophy" size={32} color="#F59E0B" />
                <Text style={styles.allTimeNumber}>{totalCompleted}</Text>
                <Text style={styles.allTimeLabel}>
                  Task{totalCompleted > 1 ? 's' : ''} Completed
                </Text>
              </View>
            </View>
          )}

          {/* Quick Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Insights</Text>
            <View style={styles.insightsList}>
              {criticalTasks > 0 && (
                <InsightItem
                  icon="flash"
                  text={`${criticalTasks} urgent task${criticalTasks > 1 ? 's' : ''} to focus on`}
                  color="#F59E0B"
                />
              )}
              {completedCritical > 0 && (
                <InsightItem
                  icon="checkmark-done"
                  text={`Completed ${completedCritical} urgent task${completedCritical > 1 ? 's' : ''} today!`}
                  color="#10B981"
                />
              )}
              {streakDays >= 3 && (
                <InsightItem
                  icon="flame"
                  text={`${streakDays} day streak! You're building a great habit!`}
                  color="#EF4444"
                />
              )}
              {completionRate >= 75 && (
                <InsightItem
                  icon="star"
                  text="You're completing most of your tasks! Excellent work!"
                  color="#A78BFA"
                />
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: string;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InsightItem({ icon, text, color }: {
  icon: string;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.insightItem}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={styles.insightText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  streakCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  streakGradient: {
    padding: 20,
    alignItems: 'center',
  },
  streakContent: {
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakDays: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 16,
    color: '#F3E8FF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  percentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressMessage: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  allTimeCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  allTimeNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#F59E0B',
    marginVertical: 8,
  },
  allTimeLabel: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
});

