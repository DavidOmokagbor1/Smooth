/**
 * Task column component (Do Now, Do Later, Optional)
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  tasks: Task[];
  maxTasks?: number;
  onTaskComplete?: (taskId: string) => void;
  priority?: 'high' | 'medium' | 'low'; // For visual emphasis
}

export function TaskColumn({
  title,
  icon,
  tasks,
  maxTasks,
  onTaskComplete,
  priority = 'medium',
}: TaskColumnProps) {
  const displayTasks = maxTasks ? tasks.slice(0, maxTasks) : tasks;
  const remainingCount = maxTasks ? Math.max(0, tasks.length - maxTasks) : 0;

  // Determine column width based on priority
  const containerStyle = [
    styles.container,
    priority === 'high' && styles.containerHigh,
    priority === 'low' && styles.containerLow,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={priority === 'high' ? 22 : 20} color="#A78BFA" />
        </View>
        <Text style={[styles.title, priority === 'high' && styles.titleHigh]}>
          {title}
        </Text>
        <View style={styles.countContainer}>
          <Text style={[styles.count, priority === 'high' && styles.countHigh]}>
            {tasks.length}{maxTasks ? `/${maxTasks}` : ''}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.tasksContainer} showsVerticalScrollIndicator={false}>
        {displayTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyBox}>
              <Ionicons name="add-circle-outline" size={32} color="#475569" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No tasks yet</Text>
              <Text style={styles.emptySubtext}>
                Add tasks using{'\n'}voice or text
              </Text>
            </View>
          </View>
        ) : (
          <>
            {displayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={onTaskComplete}
              />
            ))}
            {remainingCount > 0 && (
              <Text style={styles.moreText}>
                +{remainingCount} more
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    minHeight: 320,
  },
  containerHigh: {
    flex: 1.3, // "Do Now" gets more space
    borderColor: '#7C3AED',
    borderWidth: 2,
    backgroundColor: '#1A1F3A',
  },
  containerLow: {
    flex: 0.9, // "Optional" gets less space
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    flex: 1,
    letterSpacing: 0.3,
  },
  titleHigh: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  countContainer: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 44,
    alignItems: 'center',
  },
  count: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '700',
  },
  countHigh: {
    fontSize: 16,
    color: '#C4B5FD',
  },
  tasksContainer: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  moreText: {
    fontSize: 12,
    color: '#A78BFA',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
    fontStyle: 'italic',
    fontWeight: '600',
    paddingVertical: 8,
    backgroundColor: '#1F2937',
    borderRadius: 8,
  },
});

