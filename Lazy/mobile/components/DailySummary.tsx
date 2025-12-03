/**
 * Daily Summary Component
 * Shows end-of-day recap with achievements, insights, and motivation
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Task, Personality } from '../types';

interface DailySummaryProps {
  tasks: Task[];
  completedToday: number;
  streakDays: number;
  totalCompleted: number;
  personality: Personality;
  achievementsUnlocked?: number;
  onClose?: () => void;
  onShare?: () => void;
}

export function DailySummary({
  tasks,
  completedToday,
  streakDays,
  totalCompleted,
  personality,
  achievementsUnlocked = 0,
  onClose,
  onShare,
}: DailySummaryProps) {
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.priority === 'low');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const criticalCompleted = tasks.filter(
    t => (t.priority === 'critical' || t.priority === 'high') && 
    (t.status === 'completed' || t.priority === 'low')
  ).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPersonalityMessage = () => {
    const messages = {
      zen: [
        "You've found peace in your tasks today. Well done.",
        "Each completed task brings you closer to balance. Beautiful work.",
        "You've moved through your day with intention. Peaceful progress.",
      ],
      friend: [
        "You did amazing today! I'm so proud of you! 🎉",
        "Look at you go! You're absolutely crushing it!",
        "You're doing great! Keep up the fantastic work!",
      ],
      coach: [
        "Strong performance today! You're building excellent momentum!",
        "Outstanding execution! Every task completed is progress toward your goals!",
        "Excellent work today! You're developing powerful habits!",
      ],
    };

    const personalityMessages = messages[personality];
    return personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
  };

  const getMotivationalInsight = () => {
    if (completionRate >= 80) {
      return "You completed almost everything! You're incredibly productive!";
    }
    if (completionRate >= 50) {
      return "You made solid progress today. Every task counts!";
    }
    if (completedToday > 0) {
      return "You got things done today. That's what matters!";
    }
    return "Tomorrow is a fresh start. You've got this!";
  };

  const getStreakMessage = () => {
    if (streakDays >= 30) return "🔥 30 DAY STREAK! You're unstoppable!";
    if (streakDays >= 14) return "🔥 2 weeks strong! You're building something amazing!";
    if (streakDays >= 7) return "🔥 Week streak! You're on fire!";
    if (streakDays >= 3) return `⭐ ${streakDays} days in a row! Keep it up!`;
    if (streakDays > 0) return `✨ Day ${streakDays} of your streak!`;
    return null;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E293B', '#1A1F3A', '#0F172A']}
        style={styles.card}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="calendar" size={24} color="#A78BFA" />
            <Text style={styles.title}>Daily Summary</Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>

          {/* Main Stats Card */}
          <View style={styles.mainStatsCard}>
            <LinearGradient
              colors={['#7C3AED', '#9333EA', '#A855F7']}
              style={styles.mainStatsGradient}
            >
              <View style={styles.mainStat}>
                <Text style={styles.mainStatNumber}>{completedToday}</Text>
                <Text style={styles.mainStatLabel}>
                  Task{completedToday !== 1 ? 's' : ''} Completed
                </Text>
              </View>
              {completionRate > 0 && (
                <View style={styles.completionRate}>
                  <Text style={styles.completionRateText}>{completionRate}%</Text>
                  <Text style={styles.completionRateLabel}>Completion Rate</Text>
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Personality Message */}
          <View style={styles.messageCard}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#A78BFA" />
            <Text style={styles.messageText}>{getPersonalityMessage()}</Text>
          </View>

          {/* Highlights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Highlights</Text>
            <View style={styles.highlightsList}>
              {criticalCompleted > 0 && (
                <HighlightItem
                  icon="flash"
                  text={`Completed ${criticalCompleted} urgent task${criticalCompleted > 1 ? 's' : ''}`}
                  color="#F59E0B"
                />
              )}
              {achievementsUnlocked > 0 && (
                <HighlightItem
                  icon="trophy"
                  text={`Unlocked ${achievementsUnlocked} achievement${achievementsUnlocked > 1 ? 's' : ''}!`}
                  color="#F59E0B"
                />
              )}
              {getStreakMessage() && (
                <HighlightItem
                  icon="flame"
                  text={getStreakMessage()!}
                  color="#EF4444"
                />
              )}
              {completedToday >= 5 && (
                <HighlightItem
                  icon="star"
                  text="Completed 5+ tasks today! Amazing productivity!"
                  color="#10B981"
                />
              )}
            </View>
          </View>

          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightsCard}>
              <Text style={styles.insightText}>{getMotivationalInsight()}</Text>
              {totalCompleted > 0 && (
                <View style={styles.allTimeStat}>
                  <Ionicons name="trophy" size={16} color="#F59E0B" />
                  <Text style={styles.allTimeText}>
                    {totalCompleted} total tasks completed all time
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Tomorrow's Focus */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tomorrow's Focus</Text>
            <View style={styles.focusCard}>
              <Ionicons name="bulb" size={24} color="#F59E0B" />
              <Text style={styles.focusText}>
                {tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length > 0
                  ? `Focus on ${tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length} urgent task${tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length > 1 ? 's' : ''} tomorrow`
                  : "You're all caught up! Take time to rest and recharge."}
              </Text>
            </View>
          </View>

          {/* Share Button */}
          {onShare && (
            <TouchableOpacity
              style={styles.shareButton}
              onPress={onShare}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={20} color="#FFFFFF" />
              <Text style={styles.shareButtonText}>Share Your Progress</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function HighlightItem({ icon, text, color }: {
  icon: string;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.highlightItem}>
      <View style={[styles.highlightIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.highlightText}>{text}</Text>
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
  greetingSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  mainStatsCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mainStatsGradient: {
    padding: 24,
    alignItems: 'center',
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 12,
  },
  mainStatNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 16,
    color: '#F3E8FF',
    fontWeight: '600',
  },
  completionRate: {
    alignItems: 'center',
    marginTop: 8,
  },
  completionRateText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  completionRateLabel: {
    fontSize: 12,
    color: '#F3E8FF',
    fontWeight: '600',
  },
  messageCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  highlightsList: {
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  insightsCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  insightText: {
    fontSize: 15,
    color: '#E2E8F0',
    lineHeight: 22,
    marginBottom: 12,
  },
  allTimeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  allTimeText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  focusCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
    alignItems: 'center',
  },
  focusText: {
    flex: 1,
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

