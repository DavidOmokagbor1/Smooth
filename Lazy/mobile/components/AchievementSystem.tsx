/**
 * Achievement System Component
 * Manages and displays all achievements, XP, and levels
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AchievementBadge, Achievement } from './AchievementBadge';

interface AchievementSystemProps {
  totalCompleted: number;
  streakDays: number;
  completedToday: number;
  onClose?: () => void;
}

// Define all achievements
const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    name: 'First Step',
    description: 'Complete your first task',
    icon: 'star',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#FBBF24'],
    unlocked: false,
    xpReward: 10,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete 7 tasks in a week',
    icon: 'trophy',
    color: '#7C3AED',
    gradient: ['#7C3AED', '#9333EA'],
    unlocked: false,
    xpReward: 50,
  },
  {
    id: 'streak_3',
    name: 'On a Roll',
    description: '3 day streak',
    icon: 'flame',
    color: '#EF4444',
    gradient: ['#EF4444', '#F87171'],
    unlocked: false,
    xpReward: 25,
  },
  {
    id: 'streak_7',
    name: 'Fire Starter',
    description: '7 day streak',
    icon: 'flame',
    color: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
    unlocked: false,
    xpReward: 100,
  },
  {
    id: 'streak_30',
    name: 'Unstoppable',
    description: '30 day streak',
    icon: 'flame',
    color: '#DC2626',
    gradient: ['#DC2626', '#991B1B'],
    unlocked: false,
    xpReward: 500,
  },
  {
    id: 'task_master',
    name: 'Task Master',
    description: 'Complete 100 tasks',
    icon: 'checkmark-done-circle',
    color: '#10B981',
    gradient: ['#10B981', '#34D399'],
    unlocked: false,
    xpReward: 200,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete 5 tasks before 10am',
    icon: 'sunny',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#FCD34D'],
    unlocked: false,
    xpReward: 30,
  },
  {
    id: 'stress_master',
    name: 'Stress Master',
    description: 'Complete tasks when stressed',
    icon: 'heart',
    color: '#EC4899',
    gradient: ['#EC4899', '#F472B6'],
    unlocked: false,
    xpReward: 75,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 10 tasks in one day',
    icon: 'flash',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#60A5FA'],
    unlocked: false,
    xpReward: 150,
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Use Zen personality 10 times',
    icon: 'leaf',
    color: '#10B981',
    gradient: ['#10B981', '#6EE7B7'],
    unlocked: false,
    xpReward: 40,
  },
];

// Calculate XP needed for each level
const XP_PER_LEVEL = 100;
const getLevelFromXP = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
const getXPForNextLevel = (xp: number) => {
  const currentLevel = getLevelFromXP(xp);
  return currentLevel * XP_PER_LEVEL - xp;
};

export function AchievementSystem({
  totalCompleted,
  streakDays,
  completedToday,
  onClose,
}: AchievementSystemProps) {
  const [xp, setXP] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(ALL_ACHIEVEMENTS);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  const level = getLevelFromXP(xp);
  const xpForNextLevel = getXPForNextLevel(xp);
  const progress = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;

  // Check and unlock achievements
  useEffect(() => {
    const unlocked: string[] = [];
    const updated = achievements.map((achievement) => {
      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_task':
          shouldUnlock = totalCompleted >= 1;
          break;
        case 'week_warrior':
          shouldUnlock = totalCompleted >= 7;
          break;
        case 'streak_3':
          shouldUnlock = streakDays >= 3;
          break;
        case 'streak_7':
          shouldUnlock = streakDays >= 7;
          break;
        case 'streak_30':
          shouldUnlock = streakDays >= 30;
          break;
        case 'task_master':
          shouldUnlock = totalCompleted >= 100;
          break;
        case 'speed_demon':
          shouldUnlock = completedToday >= 10;
          break;
        default:
          shouldUnlock = false;
      }

      if (shouldUnlock && !achievement.unlocked) {
        unlocked.push(achievement.id);
        return { ...achievement, unlocked: true, unlockedAt: new Date() };
      }
      return achievement;
    });

    if (unlocked.length > 0) {
      setNewlyUnlocked(unlocked);
      setAchievements(updated);
      // Add XP for newly unlocked achievements
      const totalXP = unlocked.reduce((sum, id) => {
        const ach = updated.find((a) => a.id === id);
        return sum + (ach?.xpReward || 0);
      }, 0);
      setXP((prev) => prev + totalXP);
    }
  }, [totalCompleted, streakDays, completedToday]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalXP = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#1A1F3A']} style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.title}>Achievements</Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Level & XP Display */}
        <View style={styles.levelSection}>
          <LinearGradient
            colors={['#7C3AED', '#9333EA']}
            style={styles.levelCard}
          >
            <Text style={styles.levelLabel}>Level</Text>
            <Text style={styles.levelNumber}>{level}</Text>
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>
                {xpForNextLevel} XP to Level {level + 1}
              </Text>
              <View style={styles.xpBar}>
                <View style={[styles.xpBarFill, { width: `${progress}%` }]} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{unlockedCount}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{achievements.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>

        {/* Achievements Grid */}
        <ScrollView style={styles.achievementsScroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>All Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <AchievementBadge
                  achievement={achievement}
                  size="medium"
                  animated={newlyUnlocked.includes(achievement.id)}
                />
                <Text style={styles.achievementName} numberOfLines={1}>
                  {achievement.name}
                </Text>
                <Text style={styles.achievementDesc} numberOfLines={2}>
                  {achievement.description}
                </Text>
                {achievement.unlocked && achievement.unlockedAt && (
                  <Text style={styles.unlockedDate}>
                    Unlocked {achievement.unlockedAt.toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
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
  levelSection: {
    marginBottom: 20,
  },
  levelCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  levelLabel: {
    fontSize: 14,
    color: '#F3E8FF',
    fontWeight: '600',
    marginBottom: 4,
  },
  levelNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  xpContainer: {
    width: '100%',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 12,
    color: '#F3E8FF',
    marginBottom: 8,
    fontWeight: '600',
  },
  xpBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  statItem: {
    alignItems: 'center',
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
  achievementsScroll: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  achievementItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  unlockedDate: {
    fontSize: 9,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '600',
  },
});

