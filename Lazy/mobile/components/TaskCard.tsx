/**
 * Modern Task Card Component
 * Clean, minimalist design with better visual hierarchy
 */

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string, updates: { title?: string; priority?: string }) => void;
  onPress?: (task: Task) => void;
}

export function TaskCard({ task, onComplete, onDelete, onEdit, onPress }: TaskCardProps) {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return {
          color: '#FF6B6B',
          bgColor: '#FF6B6B15',
          icon: 'flash',
          label: 'Urgent',
        };
      case 'high':
        return {
          color: '#FFA94D',
          bgColor: '#FFA94D15',
          icon: 'arrow-up-circle',
          label: 'High',
        };
      case 'medium':
        return {
          color: '#4DABF7',
          bgColor: '#4DABF715',
          icon: 'time',
          label: 'Medium',
        };
      default:
        return {
          color: '#9775FA',
          bgColor: '#9775FA15',
          icon: 'ellipse-outline',
          label: 'Low',
        };
    }
  };

  const priority = getPriorityConfig(task.priority);

  return (
    <View style={styles.cardContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed
        ]}
        onPress={() => {
          console.log('TaskCard pressed:', task.id);
          onPress?.(task);
        }}
      >
        {/* Priority Indicator Dot */}
        <View style={[styles.priorityDot, { backgroundColor: priority.color }]} pointerEvents="none" />
        
        <View style={styles.content} pointerEvents="box-none">
          {/* Title */}
          <Text style={styles.title} numberOfLines={2} pointerEvents="none">
            {task.title}
          </Text>
          
          {/* Metadata Row */}
          <View style={styles.metadataRow} pointerEvents="none">
            {/* Location */}
            {task.category?.location && (
              <View style={styles.metadataItem}>
                <Ionicons name="location-outline" size={13} color="#94A3B8" />
                <Text style={styles.metadataText} numberOfLines={1}>
                  {task.category.location}
                </Text>
              </View>
            )}
            
            {/* Duration */}
            {task.category?.estimated_duration_minutes && (
              <View style={styles.metadataItem}>
                <Ionicons name="time-outline" size={13} color="#94A3B8" />
                <Text style={styles.metadataText}>
                  {task.category.estimated_duration_minutes}m
                </Text>
              </View>
            )}
          </View>
          
          {/* Priority Badge */}
          <View style={[styles.priorityBadge, { backgroundColor: priority.bgColor }]} pointerEvents="none">
            <Ionicons name={priority.icon as any} size={12} color={priority.color} />
            <Text style={[styles.priorityText, { color: priority.color }]}>
              {priority.label}
            </Text>
          </View>
        </View>
        
        {/* Action Buttons - Positioned absolutely to not interfere with card press */}
        <View style={styles.actions}>
          {/* Complete Checkbox */}
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => {
              console.log('Complete button pressed');
              onComplete?.(task.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[styles.checkbox, { borderColor: priority.color + '40' }]}>
              <View style={[styles.checkboxInner, { backgroundColor: priority.color + '20' }]} />
            </View>
          </TouchableOpacity>
          
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            {onEdit && (
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  console.log('Edit button pressed');
                  Alert.prompt(
                    'Edit Task',
                    'Enter new task title:',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Save',
                        onPress: (newTitle) => {
                          if (newTitle && newTitle.trim()) {
                            onEdit(task.id, { title: newTitle.trim() });
                          }
                        },
                      },
                    ],
                    'plain-text',
                    task.title
                  );
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="pencil" size={16} color="#64748B" />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  console.log('Delete button pressed');
                  onDelete?.(task.id);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#2A2F3E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPressed: {
    opacity: 0.8,
    backgroundColor: '#1F2937',
  },
  priorityDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 14,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 10,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metadataText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    maxWidth: 150,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
    marginLeft: 12,
    zIndex: 10,
  },
  completeButton: {
    marginBottom: 4,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkboxInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  quickActions: {
    flexDirection: 'column',
    gap: 6,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

