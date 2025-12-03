/**
 * Task Columns Component - Horizontal Side-by-Side Layout
 * Better UX for comparing tasks across priorities
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskCard } from './TaskCard';
import { Task } from '../types';

interface TaskColumnsProps {
  doNowTasks: Task[];
  doLaterTasks: Task[];
  optionalTasks: Task[];
  onTaskComplete?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: { title?: string; priority?: string }) => void;
  onTaskPress?: (task: Task) => void;
}

export function TaskColumns({
  doNowTasks,
  doLaterTasks,
  optionalTasks,
  onTaskComplete,
  onTaskDelete,
  onTaskUpdate,
  onTaskPress,
}: TaskColumnsProps) {
  const renderColumn = (
    title: string,
    icon: string,
    color: string,
    tasks: Task[],
    isHighlighted?: boolean
  ) => (
    <View style={[styles.column, isHighlighted && styles.columnHighlighted]}>
      <View style={styles.columnHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon as any} size={18} color={color} />
          </View>
          <Text style={[styles.columnTitle, { color }]}>{title}</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.countText, { color }]}>{tasks.length}</Text>
        </View>
      </View>
      <ScrollView
        style={styles.columnScroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onTaskComplete}
              onDelete={onTaskDelete}
              onEdit={onTaskUpdate}
              onPress={onTaskPress}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={32} color="#475569" />
            <Text style={styles.emptyText}>All done!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
      decelerationRate="fast"
    >
      {renderColumn('Do Now', 'flash', '#FFA94D', doNowTasks, true)}
      {renderColumn('Do Later', 'time', '#4DABF7', doLaterTasks)}
      {renderColumn('Optional', 'star', '#9775FA', optionalTasks)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingRight: 20,
    gap: 16,
  },
  column: {
    width: 280,
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2F3E',
    padding: 16,
    maxHeight: 600,
  },
  columnHighlighted: {
    borderColor: '#FFA94D40',
    borderWidth: 1.5,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2F3E',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 32,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  columnScroll: {
    flex: 1,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
  },
});
