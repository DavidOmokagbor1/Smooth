/**
 * Premium error message component with retry functionality
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorMessage({
  message,
  onDismiss,
  onRetry,
  showRetry = true,
}: ErrorMessageProps) {
  // Extract helpful message from error
  const getHelpfulMessage = (error: string): string => {
    if (error.includes('Network Error') || error.includes('ECONNREFUSED')) {
      return 'Cannot connect to server. Make sure the backend is running and check your network connection.';
    }
    if (error.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error;
  };

  const helpfulMessage = getHelpfulMessage(message);

  // Determine error type for better styling
  const isNetworkError = helpfulMessage.includes('connect') || helpfulMessage.includes('server');
  const errorTitle = isNetworkError ? 'Connection Error' : 'Error';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isNetworkError 
          ? ['#7F1D1D', '#991B1B', '#DC2626'] 
          : ['#92400E', '#B45309', '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={isNetworkError ? "cloud-offline" : "alert-circle"} 
              size={22} 
              color="#FEE2E2" 
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{errorTitle}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {helpfulMessage}
            </Text>
          </View>
          <View style={styles.actions}>
            {showRetry && onRetry && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={onRetry}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            )}
            {onDismiss && (
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={onDismiss}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#FEE2E2" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  gradient: {
    padding: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    color: '#FEE2E2',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dismissButton: {
    padding: 4,
  },
});

