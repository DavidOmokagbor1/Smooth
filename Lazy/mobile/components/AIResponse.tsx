/**
 * AI companion response/suggestion component
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CompanionSuggestion, Personality } from '../types';

interface AIResponseProps {
  suggestion?: CompanionSuggestion;
  personality: Personality;
  isProcessing?: boolean;
}

export function AIResponse({
  suggestion,
  personality,
  isProcessing = false,
}: AIResponseProps) {
  if (isProcessing) {
    return (
      <View style={styles.container}>
        <Text style={styles.processingText}>Thinking...</Text>
      </View>
    );
  }

  if (!suggestion) {
    return null;
  }

  return (
    <View style={styles.container}>
          <Text style={styles.message}>{suggestion.message}</Text>
          {suggestion.reasoning && (
            <View style={styles.reasoningContainer}>
              <Ionicons name="bulb-outline" size={14} color="#A78BFA" />
              <Text style={styles.reasoning}>
                {suggestion.reasoning}
              </Text>
            </View>
          )}
      {suggestion.suggested_action && (
        <Text style={styles.action}>{suggestion.suggested_action}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    marginVertical: 12,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    fontSize: 15,
    color: '#F1F5F9',
    lineHeight: 22,
    fontWeight: '400',
  },
  action: {
    fontSize: 13,
    color: '#A78BFA',
    marginTop: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  processingText: {
    fontSize: 15,
    color: '#94A3B8',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  reasoningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  reasoning: {
    fontSize: 12,
    color: '#A78BFA',
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

