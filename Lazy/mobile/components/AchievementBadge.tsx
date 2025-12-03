/**
 * Achievement Badge Component
 * Shows individual achievement badges with unlock animations
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
  unlocked: boolean;
  unlockedAt?: Date;
  xpReward: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showXP?: boolean;
  animated?: boolean;
}

export function AchievementBadge({
  achievement,
  size = 'medium',
  showXP = false,
  animated = false,
}: AchievementBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(achievement.unlocked ? 1 : 0.7)).current;
  const opacityAnim = useRef(new Animated.Value(achievement.unlocked ? 1 : 0.5)).current;

  useEffect(() => {
    if (animated && achievement.unlocked) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [achievement.unlocked, animated]);

  const sizeStyles = {
    small: { container: 60, icon: 24, text: 10 },
    medium: { container: 80, icon: 32, text: 12 },
    large: { container: 120, icon: 48, text: 14 },
  };

  const dimensions = sizeStyles[size];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: dimensions.container,
          height: dimensions.container,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {achievement.unlocked ? (
        <LinearGradient
          colors={achievement.gradient}
          style={[styles.badge, { width: dimensions.container, height: dimensions.container }]}
        >
          <Ionicons name={achievement.icon as any} size={dimensions.icon} color="#FFFFFF" />
          {showXP && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{achievement.xpReward} XP</Text>
            </View>
          )}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.badge,
            styles.locked,
            { width: dimensions.container, height: dimensions.container },
          ]}
        >
          <Ionicons name="lock-closed" size={dimensions.icon} color="#64748B" />
        </View>
      )}
      {size !== 'small' && (
        <Text style={[styles.name, { fontSize: dimensions.text }]} numberOfLines={2}>
          {achievement.name}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 8,
  },
  badge: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  locked: {
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
  },
  xpBadge: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  xpText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    marginTop: 8,
    color: '#E2E8F0',
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 100,
  },
});

