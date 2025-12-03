/**
 * Onboarding Screen - Explains the app's value and how it works
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0E27', '#1A1F3A', '#1E293B']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Title */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Ionicons name="mic-circle" size={64} color="#A78BFA" />
            </View>
            <Text style={styles.appName}>LAZY</Text>
            <Text style={styles.tagline}>Your AI Life Planner</Text>
          </View>

          {/* Value Proposition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How Lazy Works</Text>
            <Text style={styles.description}>
              Just speak your thoughts, worries, and tasks. Our AI will organize everything for you.
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <FeatureCard
              icon="mic"
              title="Speak Your Mind"
              description="Tell us everything on your mind - tasks, worries, appointments. No need to organize it yourself."
              color="#7C3AED"
            />
            <FeatureCard
              icon="sparkles"
              title="AI Prioritizes"
              description="We automatically sort tasks by urgency and importance. Focus on what matters most."
              color="#F59E0B"
            />
            <FeatureCard
              icon="heart"
              title="Stress-Free Planning"
              description="We understand your energy levels and stress. We'll suggest what to do now vs. later."
              color="#EF4444"
            />
            <FeatureCard
              icon="checkmark-circle"
              title="Simple Execution"
              description="Clear, actionable tasks organized by priority. One thing at a time, when you're ready."
              color="#3B82F6"
            />
          </View>

          {/* How It Helps */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Perfect For Busy People</Text>
            <View style={styles.helpList}>
              <HelpItem text="Overwhelmed with too many tasks" />
              <HelpItem text="Struggling with executive function" />
              <HelpItem text="Need help prioritizing" />
              <HelpItem text="Want to reduce stress and anxiety" />
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={onComplete}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#7C3AED', '#9333EA', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.startButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Your voice is all we need. Let's make life easier.
          </Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );
}

function HelpItem({ text }: { text: string }) {
  return (
    <View style={styles.helpItem}>
      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
      <Text style={styles.helpItemText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#A78BFA',
    fontWeight: '600',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    marginBottom: 32,
    gap: 20,
  },
  featureCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  helpSection: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#334155',
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  helpList: {
    gap: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpItemText: {
    fontSize: 15,
    color: '#E2E8F0',
    flex: 1,
  },
  startButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

