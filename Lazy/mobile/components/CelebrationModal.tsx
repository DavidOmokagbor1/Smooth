/**
 * Celebration Modal Component
 * Shows delightful celebration when tasks are completed
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Personality } from '../types';

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  personality: Personality;
  taskTitle?: string;
  streakCount?: number;
  totalCompleted?: number;
}

const { width } = Dimensions.get('window');

export function CelebrationModal({
  visible,
  onClose,
  personality,
  taskTitle,
  streakCount = 0,
  totalCompleted = 0,
}: CelebrationModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      confettiAnim.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getCelebrationMessage = () => {
    const messages = {
      zen: [
        "Peaceful completion. Well done.",
        "You've found your flow. Beautiful.",
        "One task at a time. You're doing great.",
      ],
      friend: [
        "You did it! So proud of you! 🎉",
        "Look at you go! Amazing work!",
        "You're crushing it! Keep it up!",
      ],
      coach: [
        "Excellent execution! That's how it's done!",
        "Strong finish! You're building momentum!",
        "Outstanding! One step closer to your goals!",
      ],
    };

    const personalityMessages = messages[personality];
    return personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
  };

  const getIcon = () => {
    if (streakCount >= 7) return 'flame';
    if (streakCount >= 3) return 'star';
    return 'checkmark-circle';
  };

  const getStreakMessage = () => {
    if (streakCount >= 7) return `🔥 ${streakCount} day streak! You're on fire!`;
    if (streakCount >= 3) return `⭐ ${streakCount} days in a row! Keep it up!`;
    if (streakCount >= 1) return `✨ Day ${streakCount} of your streak!`;
    return null;
  };

  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const confettiOpacity = confettiAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0.8],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale }],
            },
          ]}
        >
          {/* Confetti Effect */}
          <Animated.View
            style={[
              styles.confettiContainer,
              { opacity: confettiOpacity },
            ]}
          >
            {[...Array(20)].map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.confetti,
                  {
                    left: `${(i * 5) % 100}%`,
                    backgroundColor: ['#7C3AED', '#A78BFA', '#C4B5FD', '#DDD6FE'][i % 4],
                    transform: [
                      {
                        rotate: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${360 * (i % 2 === 0 ? 1 : -1)}deg`],
                        }),
                      },
                      {
                        translateY: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 200],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </Animated.View>

          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#A855F7']}
            style={styles.card}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Ionicons name={getIcon()} size={64} color="#FFFFFF" />
              </View>

              <Text style={styles.title}>Task Completed!</Text>

              {taskTitle && (
                <Text style={styles.taskTitle} numberOfLines={2}>
                  {taskTitle}
                </Text>
              )}

              <Text style={styles.message}>
                {getCelebrationMessage()}
              </Text>

              {getStreakMessage() && (
                <View style={styles.streakContainer}>
                  <Text style={styles.streakText}>{getStreakMessage()}</Text>
                </View>
              )}

              {totalCompleted > 0 && (
                <View style={styles.statsContainer}>
                  <Text style={styles.statsText}>
                    {totalCompleted} task{totalCompleted > 1 ? 's' : ''} completed today
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Awesome!</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
  },
  confettiContainer: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 1,
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  taskTitle: {
    fontSize: 16,
    color: '#F3E8FF',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  streakContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 12,
  },
  streakText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#F3E8FF',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

