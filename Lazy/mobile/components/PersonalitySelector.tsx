/**
 * Personality selector component (Zen Master, Best Friend, Coach)
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Personality } from '../types';

interface PersonalitySelectorProps {
  selected: Personality;
  onSelect: (personality: Personality) => void;
}

const personalities: {
  key: Personality;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: 'zen',
    label: 'Zen Master',
    description: 'Calm, mindful guidance',
    icon: 'leaf',
  },
  {
    key: 'friend',
    label: 'Best Friend',
    description: 'Supportive & encouraging',
    icon: 'heart',
  },
  {
    key: 'coach',
    label: 'Coach',
    description: 'Motivating & energetic',
    icon: 'flash',
  },
];

export function PersonalitySelector({
  selected,
  onSelect,
}: PersonalitySelectorProps) {
  return (
    <View style={styles.container}>
      {personalities.map((personality) => {
        const isSelected = selected === personality.key;
        const CardWrapper = isSelected ? LinearGradient : View;
        const cardProps = isSelected
          ? {
              colors: ['#7C3AED', '#9333EA', '#A855F7'],
              start: { x: 0, y: 0 },
              end: { x: 1, y: 1 },
            }
          : {};

        return (
          <TouchableOpacity
            key={personality.key}
            onPress={() => onSelect(personality.key)}
            activeOpacity={0.8}
            style={styles.cardTouchable}
          >
            <CardWrapper
              {...cardProps}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={personality.icon}
                  size={28}
                  color={isSelected ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
              <View style={styles.textContainer}>
                <Text 
                  style={[
                    styles.label,
                    isSelected && styles.labelSelected,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {personality.label}
                </Text>
                <Text 
                  style={[
                    styles.description,
                    isSelected && styles.descriptionSelected,
                  ]}
                  numberOfLines={2}
                >
                  {personality.description}
                </Text>
              </View>
              {isSelected && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>Active</Text>
                </View>
              )}
            </CardWrapper>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    gap: 10,
  },
  cardTouchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    height: 160,
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardSelected: {
    borderWidth: 0,
    shadowColor: '#7C3AED',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 4,
    minHeight: 20,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
  description: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
  },
  descriptionSelected: {
    color: '#E9D5FF',
  },
  activeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

