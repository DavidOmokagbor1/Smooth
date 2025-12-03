/**
 * Task Detail Modal Component
 * Shows comprehensive task details when clicking on a task
 * Includes reminder functionality and AI insights
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import * as Notifications from 'expo-notifications';
// Date picker - install with: npx expo install @react-native-community/datetimepicker
let DateTimePicker: any = null;
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
} catch (e) {
  console.warn('DateTimePicker not available. Using fallback.');
}

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onComplete?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onUpdate?: (taskId: string, updates: any) => void;
  onSetReminder?: (taskId: string, reminderTime: Date) => void;
}

export function TaskDetailModal({
  visible,
  task,
  onClose,
  onComplete,
  onDelete,
  onUpdate,
  onSetReminder,
}: TaskDetailModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // Update reminder state when task changes
  useEffect(() => {
    if (task?.reminder_time) {
      setReminderTime(new Date(task.reminder_time));
      setReminderEnabled(true);
    } else {
      setReminderTime(null);
      setReminderEnabled(false);
    }
  }, [task]);

  if (!task) return null;

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { color: '#FF6B6B', icon: 'flash', label: 'Urgent' };
      case 'high':
        return { color: '#FFA94D', icon: 'arrow-up-circle', label: 'High' };
      case 'medium':
        return { color: '#4DABF7', icon: 'time', label: 'Medium' };
      default:
        return { color: '#9775FA', icon: 'ellipse-outline', label: 'Low' };
    }
  };

  const priority = getPriorityConfig(task.priority);

  const handleSetReminder = async () => {
    if (!reminderTime) {
      Alert.alert('Select Time', 'Please select a reminder time first.');
      return;
    }

    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Notification permission is needed to set reminders.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Reminder: ${task.title}`,
          body: task.category?.location 
            ? `Don't forget: ${task.title} at ${task.category.location}`
            : `Time to do: ${task.title}`,
          sound: true,
          data: { taskId: task.id },
        },
        trigger: reminderTime,
      });

      if (onSetReminder) {
        onSetReminder(task.id, reminderTime);
      }

      Alert.alert('Reminder Set!', `You'll be reminded at ${reminderTime.toLocaleTimeString()}.`);
      setReminderEnabled(true);
    } catch (error: any) {
      console.error('Error setting reminder:', error);
      Alert.alert('Error', 'Failed to set reminder. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete?.(task.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.priorityIndicator, { backgroundColor: priority.color + '20' }]}>
                <Ionicons name={priority.icon as any} size={20} color={priority.color} />
              </View>
              <Text style={styles.title}>Task Details</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Task Title */}
            <View style={styles.section}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.priorityBadge}>
                <Ionicons name={priority.icon as any} size={14} color={priority.color} />
                <Text style={[styles.priorityText, { color: priority.color }]}>
                  {priority.label} Priority
                </Text>
              </View>
            </View>

            {/* Task Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Task Information</Text>
              
              {task.description && (
                <View style={styles.infoRow}>
                  <Ionicons name="document-text-outline" size={18} color="#94A3B8" />
                  <Text style={styles.infoText}>{task.description}</Text>
                </View>
              )}

              {task.category?.location && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color="#94A3B8" />
                  <Text style={styles.infoText}>{task.category.location}</Text>
                </View>
              )}

              {task.category?.estimated_duration_minutes && (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={18} color="#94A3B8" />
                  <Text style={styles.infoText}>
                    Estimated: {task.category.estimated_duration_minutes} minutes
                  </Text>
                </View>
              )}

              {task.category?.type && (
                <View style={styles.infoRow}>
                  <Ionicons name="folder-outline" size={18} color="#94A3B8" />
                  <Text style={styles.infoText}>
                    Type: {task.category.type.charAt(0).toUpperCase() + task.category.type.slice(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* Reminder Section */}
            <View style={styles.section}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderHeaderLeft}>
                  <Ionicons name="notifications-outline" size={20} color="#4DABF7" />
                  <Text style={styles.sectionTitle}>Reminder</Text>
                </View>
                <Switch
                  value={reminderEnabled}
                  onValueChange={(value) => {
                    setReminderEnabled(value);
                    if (value && !reminderTime) {
                      setShowDatePicker(true);
                    }
                  }}
                  trackColor={{ false: '#475569', true: '#4DABF720' }}
                  thumbColor={reminderEnabled ? '#4DABF7' : '#94A3B8'}
                />
              </View>

              {reminderEnabled && (
                <View style={styles.reminderContent}>
                  {!reminderTime ? (
                    <TouchableOpacity
                      style={styles.setTimeButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="time-outline" size={18} color="#4DABF7" />
                      <Text style={styles.setTimeButtonText}>Set Reminder Time</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.timeDisplay}>
                      <Text style={styles.timeText}>
                        {reminderTime.toLocaleDateString()} at {reminderTime.toLocaleTimeString()}
                      </Text>
                      <TouchableOpacity
                        style={styles.changeTimeButton}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text style={styles.changeTimeText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {showDatePicker && DateTimePicker && (
                    <DateTimePicker
                      value={reminderTime || new Date()}
                      mode="datetime"
                      is24Hour={false}
                      display="default"
                      onChange={(event: any, selectedDate?: Date) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setReminderTime(selectedDate);
                          handleSetReminder();
                        }
                      }}
                    />
                  )}
                  {showDatePicker && !DateTimePicker && (
                    <View style={styles.fallbackPicker}>
                      <Text style={styles.fallbackText}>
                        Date picker not available. Please install @react-native-community/datetimepicker
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* AI Insights Section */}
            <View style={styles.section}>
              <View style={styles.insightsHeader}>
                <Ionicons name="sparkles" size={20} color="#A78BFA" />
                <Text style={styles.sectionTitle}>AI Insights</Text>
              </View>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  {task.priority === 'critical' || task.priority === 'high'
                    ? "This is a high-priority task. Consider doing it soon to reduce stress."
                    : task.category?.type === 'errand'
                    ? "This errand can be batched with other location-based tasks to save time."
                    : "This task can be done when you have moderate energy."}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => {
                onComplete?.(task.id);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Mark Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1A1F2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2F3E',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
    lineHeight: 30,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  priorityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#E2E8F0',
    flex: 1,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reminderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderContent: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
  },
  setTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  setTimeButtonText: {
    fontSize: 15,
    color: '#4DABF7',
    fontWeight: '600',
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 15,
    color: '#E2E8F0',
    fontWeight: '500',
  },
  changeTimeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changeTimeText: {
    fontSize: 14,
    color: '#4DABF7',
    fontWeight: '600',
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  insightCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#A78BFA',
  },
  insightText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2F3E',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#EF444440',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  fallbackPicker: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
  fallbackText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

