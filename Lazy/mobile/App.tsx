/**
 * Lazy - AI-Powered Executive Function Companion
 * Main App Component
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { Header } from './components/Header';
import { PersonalitySelector } from './components/PersonalitySelector';
import { VoiceInputButton } from './components/VoiceInputButton';
import { TaskCard } from './components/TaskCard';
import { TaskColumns } from './components/TaskColumns';
import { AIResponse } from './components/AIResponse';
import { ErrorMessage } from './components/ErrorMessage';
import { OnboardingScreen } from './components/OnboardingScreen';
import { CelebrationModal } from './components/CelebrationModal';
import { SettingsModal } from './components/SettingsModal';
import { ProgressDashboard } from './components/ProgressDashboard';
import { AchievementSystem } from './components/AchievementSystem';
import { MoodTracker } from './components/MoodTracker';
import { DailySummary } from './components/DailySummary';
import { PredictiveCard } from './components/PredictiveCard';
import { RoutePlanModal } from './components/RoutePlanModal';
import { TaskDetailModal } from './components/TaskDetailModal';

import { Personality, Task, VoiceProcessingResponse, CompanionSuggestion } from './types';
import { processVoiceInput, processTextInput, getTasks, completeTask, deleteTask, updateTask, planRoute, RoutePlan } from './services/api';

export default function App() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(false);
  const [personality, setPersonality] = useState<Personality>('friend');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestion, setSuggestion] = useState<CompanionSuggestion | undefined>();
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastAudioUri, setLastAudioUri] = useState<string | null>(null);
  const [emotionalState, setEmotionalState] = useState<{ primary_emotion: string; energy_level: number; stress_level: number } | undefined>();
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedTaskTitle, setCompletedTaskTitle] = useState<string>('');
  const [showProgress, setShowProgress] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showDailySummary, setShowDailySummary] = useState(false);
  const [achievementsUnlocked, setAchievementsUnlocked] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoutePlan, setShowRoutePlan] = useState(false);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [isPlanningRoute, setIsPlanningRoute] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Check if user has seen onboarding
  useEffect(() => {
    // In a real app, check AsyncStorage
    // For now, default to true to skip onboarding (set to false to show it)
    setHasSeenOnboarding(true);
  }, []);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      console.log('🔄 Loading tasks...');
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
      // Clear error on successful load
      setError(null);
      console.log('✅ Tasks loaded:', fetchedTasks.length);
    } catch (error: any) {
      console.error('❌ Failed to load tasks:', error);
      // Only show error if it's a connection issue, not silently fail
      if (error.message?.includes('Network') || error.message?.includes('ECONNREFUSED') || error.message?.includes('connect')) {
        setError(error.message || 'Cannot connect to server. Make sure the backend is running and ngrok is active.');
      }
    }
  };

  const handleVoiceComplete = useCallback(async (audioUri: string) => {
    setIsProcessing(true);
    setSuggestion(undefined);
    setError(null);
    setLastAudioUri(audioUri);

    try {
      const response: VoiceProcessingResponse = await processVoiceInput(audioUri);
      
      // Update tasks
      setTasks(response.tasks);
      
      // Store emotional state for insights
      setEmotionalState({
        primary_emotion: response.emotional_state.primary_emotion,
        energy_level: response.emotional_state.energy_level,
        stress_level: response.emotional_state.stress_level,
      });
      
      // Show AI suggestion
      setSuggestion(response.companion_suggestion);
      
      // Reload tasks from server to get saved ones
      await loadTasks();
      
      // Clear any previous errors
      setError(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process voice input. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Voice processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastAudioUri) {
      handleVoiceComplete(lastAudioUri);
    }
  }, [lastAudioUri, handleVoiceComplete]);

  const handleTextSubmit = useCallback(async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    setSuggestion(undefined);
    setError(null);
    setTextInput(''); // Clear input immediately for better UX

    try {
      const response: VoiceProcessingResponse = await processTextInput(textInput.trim());
      
      // Update tasks
      setTasks(response.tasks);
      
      // Store emotional state for insights
      setEmotionalState({
        primary_emotion: response.emotional_state.primary_emotion,
        energy_level: response.emotional_state.energy_level,
        stress_level: response.emotional_state.stress_level,
      });
      
      // Show AI suggestion
      setSuggestion(response.companion_suggestion);
      
      // Reload tasks from server to get saved ones
      await loadTasks();
      
      // Clear any previous errors
      setError(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to process text input. Please check your connection and try again.';
      setError(errorMessage);
      console.error('Text processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [textInput]);

  const handleTaskComplete = useCallback(async (taskId: string) => {
    try {
      // Find the task before completing to show in celebration
      const taskToComplete = tasks.find(t => t.id === taskId);
      const taskTitle = taskToComplete?.title || 'Task';
      
      await completeTask(taskId);
      
      // Show celebration
      setCompletedTaskTitle(taskTitle);
      setShowCelebration(true);
      
      // Update stats
      setCompletedToday(prev => prev + 1);
      setTotalCompleted(prev => prev + 1);
      
      // Reload tasks
      await loadTasks();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to complete task. Please try again.');
    }
  }, [tasks]);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              // Reload tasks
              await loadTasks();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
        },
      ]
    );
  }, []);

  const handleTaskUpdate = useCallback(async (
    taskId: string,
    updates: { title?: string; description?: string; priority?: string; reminder_time?: string }
  ) => {
    try {
      await updateTask(taskId, updates);
      // Reload tasks
      await loadTasks();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  }, []);

  const handlePlanRoute = useCallback(async () => {
    try {
      setIsPlanningRoute(true);
      
      // Get tasks with locations (errands/appointments)
      const locationTasks = tasks.filter(
        (t) => t.category?.location && 
        (t.category.type === 'errand' || t.category.type === 'appointment')
      );
      
      if (locationTasks.length < 2) {
        Alert.alert(
          'Not Enough Locations',
          'You need at least 2 tasks with locations to plan a route.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Plan route
      const taskIds = locationTasks.map((t) => t.id);
      const route = await planRoute(taskIds, 'errand');
      
      setRoutePlan(route);
      setShowRoutePlan(true);
    } catch (error: any) {
      console.error('Error planning route:', error);
      Alert.alert(
        'Route Planning Error',
        error.message || 'Failed to plan route. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPlanningRoute(false);
    }
  }, [tasks]);

  // Categorize tasks
  const doNowTasks = tasks.filter(
    (t) => t.priority === 'critical' || t.priority === 'high'
  );
  const doLaterTasks = tasks.filter((t) => t.priority === 'medium');
  const optionalTasks = tasks.filter((t) => t.priority === 'low');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Header onSettingsPress={() => setShowSettings(true)} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Message - Single consolidated error */}
          {error && (
            <View style={styles.errorContainer}>
              <ErrorMessage
                message={error}
                onDismiss={() => setError(null)}
                onRetry={handleRetry}
                showRetry={!!lastAudioUri}
              />
            </View>
          )}

          {/* Personality Selector */}
          <View style={styles.personalitySection}>
            <PersonalitySelector
              selected={personality}
              onSelect={setPersonality}
            />
          </View>

          {/* Voice Input Section */}
          <View style={styles.voiceSection}>
            <VoiceInputButton
              onRecordingComplete={handleVoiceComplete}
              isProcessing={isProcessing}
            />

            {/* Text Input (Alternative) */}
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Or type here..."
                placeholderTextColor="#6B7280"
                value={textInput}
                onChangeText={setTextInput}
                onSubmitEditing={handleTextSubmit}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleTextSubmit}
              >
                <Ionicons name="send" size={20} color="#A78BFA" />
              </TouchableOpacity>
            </View>

            {/* AI Response */}
            {suggestion && (
              <AIResponse
                suggestion={suggestion}
                personality={personality}
                isProcessing={isProcessing}
              />
            )}

            {/* Predictive Card - Smart suggestions */}
            {tasks.length > 0 && (
              <PredictiveCard
                tasks={tasks}
                completedToday={completedToday}
                onSuggestionPress={async (suggestion) => {
                  if (suggestion === 'Plan your route for errands') {
                    await handlePlanRoute();
                  } else {
                    console.log('Suggestion pressed:', suggestion);
                  }
                }}
              />
            )}
          </View>

          {/* Tasks Section */}
          <View style={styles.tasksSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Your Tasks</Text>
                <Text style={styles.sectionSubtitle}>
                  Organized by priority • AI-powered
                </Text>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.taskCount}>{tasks.length} total</Text>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowDailySummary(true)}
                >
                  <Ionicons name="calendar" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowMoodTracker(true)}
                >
                  <Ionicons name="heart" size={20} color="#EC4899" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowAchievements(true)}
                >
                  <Ionicons name="trophy" size={20} color="#F59E0B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowProgress(true)}
                >
                  <Ionicons name="stats-chart" size={20} color="#A78BFA" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Horizontal Priority Columns - Side by Side for Easy Comparison */}
            {tasks.length > 0 && (
              <TaskColumns
                doNowTasks={doNowTasks}
                doLaterTasks={doLaterTasks}
                optionalTasks={optionalTasks}
                onTaskComplete={handleTaskComplete}
                onTaskDelete={handleTaskDelete}
                onTaskUpdate={handleTaskUpdate}
                onTaskPress={(task) => {
                  setSelectedTask(task);
                  setShowTaskDetail(true);
                }}
              />
            )}

            {/* Empty State */}
            {tasks.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <View style={styles.emptyStateCard}>
                  <Ionicons name="document-text-outline" size={48} color="#475569" />
                  <Text style={styles.emptyStateTitle}>No tasks yet</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Use the microphone button above to add tasks{'\n'}
                    or type them in the text field
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Celebration Modal */}
      <CelebrationModal
        visible={showCelebration}
        onClose={() => setShowCelebration(false)}
        personality={personality}
        taskTitle={completedTaskTitle}
        streakCount={streakDays}
        totalCompleted={completedToday}
      />

      {/* Progress Dashboard Modal */}
      {showProgress && (
        <View style={styles.progressModalOverlay}>
          <TouchableOpacity
            style={styles.progressModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowProgress(false)}
          />
          <View style={styles.progressModalContent}>
            <ProgressDashboard
              tasks={tasks}
              completedToday={completedToday}
              streakDays={streakDays}
              totalCompleted={totalCompleted}
              onClose={() => setShowProgress(false)}
            />
          </View>
        </View>
      )}

      {/* Achievement System Modal */}
      {showAchievements && (
        <View style={styles.progressModalOverlay}>
          <TouchableOpacity
            style={styles.progressModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAchievements(false)}
          />
          <View style={styles.progressModalContent}>
            <AchievementSystem
              totalCompleted={totalCompleted}
              streakDays={streakDays}
              completedToday={completedToday}
              onClose={() => setShowAchievements(false)}
            />
          </View>
        </View>
      )}

      {/* Mood Tracker Modal */}
      {showMoodTracker && (
        <View style={styles.progressModalOverlay}>
          <TouchableOpacity
            style={styles.progressModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowMoodTracker(false)}
          />
          <View style={styles.progressModalContent}>
            <MoodTracker
              currentMood={emotionalState}
              onClose={() => setShowMoodTracker(false)}
            />
          </View>
        </View>
      )}

      {/* Daily Summary Modal */}
      {showDailySummary && (
        <View style={styles.progressModalOverlay}>
          <TouchableOpacity
            style={styles.progressModalBackdrop}
            activeOpacity={1}
            onPress={() => setShowDailySummary(false)}
          />
          <View style={styles.progressModalContent}>
            <DailySummary
              tasks={tasks}
              completedToday={completedToday}
              streakDays={streakDays}
              totalCompleted={totalCompleted}
              personality={personality}
              achievementsUnlocked={achievementsUnlocked}
              onClose={() => setShowDailySummary(false)}
              onShare={() => {
                // Share functionality - could use expo-sharing
                Alert.alert('Share', 'Share your daily progress!');
              }}
            />
          </View>
        </View>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        visible={showTaskDetail}
        task={selectedTask}
        onClose={() => {
          setShowTaskDetail(false);
          setSelectedTask(null);
        }}
        onComplete={handleTaskComplete}
        onDelete={handleTaskDelete}
        onUpdate={handleTaskUpdate}
        onSetReminder={async (taskId, reminderTime) => {
          try {
            // Update task with reminder time
            await handleTaskUpdate(taskId, { reminder_time: reminderTime.toISOString() });
          } catch (error: any) {
            console.error('Error setting reminder:', error);
          }
        }}
      />
      {/* Route Plan Modal */}
      <RoutePlanModal
        visible={showRoutePlan}
        routePlan={routePlan}
        onClose={() => setShowRoutePlan(false)}
      />
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        personality={personality}
        onPersonalityChange={setPersonality}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27', // Even deeper, more premium dark
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  personalitySection: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  voiceSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    paddingTop: 8,
  },
  textInputContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 16,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    color: '#F1F5F9',
    fontSize: 15,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendButton: {
    padding: 8,
    marginLeft: 10,
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 4,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  iconButton: {
    padding: 7,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginLeft: 6,
  },
  progressModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  progressModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  progressModalContent: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    bottom: '10%',
    paddingHorizontal: 20,
  },
  prioritySection: {
    marginBottom: 28,
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2F3E',
  },
  priorityHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priorityTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  priorityCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 36,
    textAlign: 'center',
    overflow: 'hidden',
  },
  tasksList: {
    gap: 0, // TaskCard already has marginBottom
  },
  emptyStateContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
});
