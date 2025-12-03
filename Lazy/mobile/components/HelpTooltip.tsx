/**
 * Help Tooltip - Explains what the app does
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export function HelpTooltip() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => setIsVisible(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="help-circle-outline" size={22} color="#94A3B8" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <LinearGradient
              colors={['#1E293B', '#1A1F3A']}
              style={styles.gradient}
            >
              <View style={styles.header}>
                <Text style={styles.title}>How Lazy Works</Text>
                <TouchableOpacity
                  onPress={() => setIsVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <HelpItem
                  icon="mic"
                  title="1. Speak Your Mind"
                  description="Press the microphone and tell us everything - tasks, worries, appointments. No need to organize it yourself."
                />
                <HelpItem
                  icon="sparkles"
                  title="2. AI Organizes"
                  description="Our AI automatically extracts tasks, prioritizes them by urgency, and understands your emotional state."
                />
                <HelpItem
                  icon="list"
                  title="3. Smart Prioritization"
                  description="Tasks are organized into 'Do Now' (urgent), 'Do Later' (important), and 'Optional' (nice to have)."
                />
                <HelpItem
                  icon="heart"
                  title="4. Stress-Free Planning"
                  description="We adapt to your energy and stress levels. If you're overwhelmed, we'll suggest fewer, simpler tasks."
                />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Your voice is all we need. Let's make life easier.
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function HelpItem({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.helpItem}>
      <View style={styles.helpIconContainer}>
        <Ionicons name={icon} size={24} color="#A78BFA" />
      </View>
      <View style={styles.helpTextContainer}>
        <Text style={styles.helpTitle}>{title}</Text>
        <Text style={styles.helpDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  helpButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    gap: 20,
  },
  helpItem: {
    flexDirection: 'row',
    gap: 16,
  },
  helpIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C3AED20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  helpDescription: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  footer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

