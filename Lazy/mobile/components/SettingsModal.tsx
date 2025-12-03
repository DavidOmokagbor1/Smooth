/**
 * Settings Modal Component
 * Advanced settings and preferences
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Personality } from '../types';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  personality: Personality;
  onPersonalityChange: (personality: Personality) => void;
}

export function SettingsModal({
  visible,
  onClose,
  personality,
  onPersonalityChange,
}: SettingsModalProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [celebrationsEnabled, setCelebrationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications',
          label: 'Push Notifications',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
          type: 'switch' as const,
        },
        {
          icon: 'sparkles',
          label: 'Celebrations',
          value: celebrationsEnabled,
          onToggle: setCelebrationsEnabled,
          type: 'switch' as const,
        },
        {
          icon: 'volume-high',
          label: 'Sound Effects',
          value: soundEnabled,
          onToggle: setSoundEnabled,
          type: 'switch' as const,
        },
        {
          icon: 'save',
          label: 'Auto-save Tasks',
          value: autoSave,
          onToggle: setAutoSave,
          type: 'switch' as const,
        },
      ],
    },
    {
      title: 'AI Personality',
      items: [
        {
          icon: 'leaf',
          label: 'Zen Master',
          value: personality === 'zen',
          onPress: () => onPersonalityChange('zen'),
          type: 'select' as const,
        },
        {
          icon: 'heart',
          label: 'Best Friend',
          value: personality === 'friend',
          onPress: () => onPersonalityChange('friend'),
          type: 'select' as const,
        },
        {
          icon: 'fitness',
          label: 'Coach',
          value: personality === 'coach',
          onPress: () => onPersonalityChange('coach'),
          type: 'select' as const,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle',
          label: 'App Version',
          value: '1.0.0',
          type: 'info' as const,
        },
        {
          icon: 'help-circle',
          label: 'Help & Support',
          onPress: () => {},
          type: 'action' as const,
        },
        {
          icon: 'shield-checkmark',
          label: 'Privacy Policy',
          onPress: () => {},
          type: 'action' as const,
        },
      ],
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#0F172A', '#1E293B']}
            style={styles.content}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Settings</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {settingsSections.map((section, sectionIndex) => (
                <View key={sectionIndex} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <View style={styles.sectionContent}>
                    {section.items.map((item, itemIndex) => (
                      <SettingItem key={itemIndex} item={item} />
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

function SettingItem({ item }: { item: any }) {
  if (item.type === 'switch') {
    return (
      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: '#7C3AED20' }]}>
            <Ionicons name={item.icon as any} size={20} color="#A78BFA" />
          </View>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#334155', true: '#7C3AED' }}
          thumbColor={item.value ? '#A78BFA' : '#64748B'}
        />
      </View>
    );
  }

  if (item.type === 'select') {
    return (
      <TouchableOpacity
        style={[styles.settingRow, item.value && styles.settingRowSelected]}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: '#7C3AED20' }]}>
            <Ionicons name={item.icon as any} size={20} color="#A78BFA" />
          </View>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        {item.value && (
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
        )}
      </TouchableOpacity>
    );
  }

  if (item.type === 'info') {
    return (
      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: '#7C3AED20' }]}>
            <Ionicons name={item.icon as any} size={20} color="#A78BFA" />
          </View>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        <Text style={styles.settingValue}>{item.value}</Text>
      </View>
    );
  }

  if (item.type === 'action') {
    return (
      <TouchableOpacity
        style={styles.settingRow}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: '#7C3AED20' }]}>
            <Ionicons name={item.icon as any} size={20} color="#A78BFA" />
          </View>
          <Text style={styles.settingLabel}>{item.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#64748B" />
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  content: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  settingRowSelected: {
    backgroundColor: '#7C3AED10',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  settingValue: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
});

