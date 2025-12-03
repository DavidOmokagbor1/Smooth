/**
 * Mood Tracker Component
 * Shows mood and energy trends over time
 */

import React from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface MoodData {
  date: Date;
  emotion: string;
  energyLevel: number;
  stressLevel: number;
}

interface MoodTrackerProps {
  moodHistory?: MoodData[];
  currentMood?: {
    primary_emotion: string;
    energy_level: number;
    stress_level: number;
  };
  onClose?: () => void;
}

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 80;
const CHART_HEIGHT = 200;

export function MoodTracker({
  moodHistory = [],
  currentMood,
  onClose,
}: MoodTrackerProps) {
  // Generate sample data if none provided (for demo)
  const data = moodHistory.length > 0
    ? moodHistory
    : generateSampleData();

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'stressed':
      case 'anxious':
        return '#EF4444';
      case 'tired':
      case 'exhausted':
        return '#64748B';
      case 'energetic':
      case 'excited':
        return '#10B981';
      case 'neutral':
      case 'calm':
        return '#3B82F6';
      default:
        return '#7C3AED';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'stressed':
      case 'anxious':
        return 'alert-circle';
      case 'tired':
      case 'exhausted':
        return 'moon';
      case 'energetic':
      case 'excited':
        return 'flash';
      case 'neutral':
      case 'calm':
        return 'happy';
      default:
        return 'heart';
    }
  };

  // Calculate averages
  const avgEnergy = data.reduce((sum, d) => sum + d.energyLevel, 0) / data.length;
  const avgStress = data.reduce((sum, d) => sum + d.stressLevel, 0) / data.length;
  const mostCommonEmotion = getMostCommonEmotion(data);

  // Find peak energy time
  const peakEnergy = Math.max(...data.map((d) => d.energyLevel));
  const peakEnergyData = data.find((d) => d.energyLevel === peakEnergy);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E293B', '#1A1F3A']} style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="heart" size={24} color="#EC4899" />
            <Text style={styles.title}>Mood & Energy Tracker</Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Current Mood */}
          {currentMood && (
            <View style={styles.currentMoodSection}>
              <Text style={styles.sectionTitle}>Right Now</Text>
              <View style={styles.currentMoodCard}>
                <View style={styles.moodIndicator}>
                  <Ionicons
                    name={getEmotionIcon(currentMood.primary_emotion) as any}
                    size={32}
                    color={getEmotionColor(currentMood.primary_emotion)}
                  />
                  <Text style={styles.moodEmotion}>{currentMood.primary_emotion}</Text>
                </View>
                <View style={styles.moodBars}>
                  <MoodBar
                    label="Energy"
                    value={currentMood.energy_level}
                    color="#10B981"
                    icon="flash"
                  />
                  <MoodBar
                    label="Stress"
                    value={currentMood.stress_level}
                    color="#EF4444"
                    icon="alert-circle"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightsList}>
              <InsightCard
                icon="trending-up"
                title="Average Energy"
                value={`${Math.round(avgEnergy * 100)}%`}
                color="#10B981"
                description="Your average energy level"
              />
              <InsightCard
                icon="trending-down"
                title="Average Stress"
                value={`${Math.round(avgStress * 100)}%`}
                color="#EF4444"
                description="Your average stress level"
              />
              <InsightCard
                icon={getEmotionIcon(mostCommonEmotion)}
                title="Most Common Mood"
                value={mostCommonEmotion}
                color={getEmotionColor(mostCommonEmotion)}
                description="Your typical emotional state"
              />
              {peakEnergyData && (
                <InsightCard
                  icon="star"
                  title="Peak Energy"
                  value={`${Math.round(peakEnergy * 100)}%`}
                  color="#F59E0B"
                  description={`Highest energy recorded`}
                />
              )}
            </View>
          </View>

          {/* Energy Trend Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Energy Trend</Text>
            <View style={styles.chartContainer}>
              <SimpleChart
                data={data.map((d) => d.energyLevel)}
                color="#10B981"
                label="Energy Level"
              />
            </View>
          </View>

          {/* Stress Trend Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stress Trend</Text>
            <View style={styles.chartContainer}>
              <SimpleChart
                data={data.map((d) => d.stressLevel)}
                color="#EF4444"
                label="Stress Level"
              />
            </View>
          </View>

          {/* Mood Calendar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Moods</Text>
            <View style={styles.moodCalendar}>
              {data.slice(-7).map((mood, index) => (
                <View key={index} style={styles.moodDay}>
                  <Text style={styles.moodDayLabel}>
                    {mood.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <View
                    style={[
                      styles.moodDayCircle,
                      { backgroundColor: getEmotionColor(mood.emotion) + '40' },
                    ]}
                  >
                    <Ionicons
                      name={getEmotionIcon(mood.emotion) as any}
                      size={20}
                      color={getEmotionColor(mood.emotion)}
                    />
                  </View>
                  <Text style={styles.moodDayEmotion} numberOfLines={1}>
                    {mood.emotion}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

function MoodBar({ label, value, color, icon }: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <View style={styles.moodBarContainer}>
      <View style={styles.moodBarHeader}>
        <Ionicons name={icon as any} size={16} color={color} />
        <Text style={styles.moodBarLabel}>{label}</Text>
        <Text style={[styles.moodBarValue, { color }]}>
          {Math.round(value * 100)}%
        </Text>
      </View>
      <View style={styles.moodBar}>
        <View style={[styles.moodBarFill, { width: `${value * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function InsightCard({ icon, title, value, color, description }: {
  icon: string;
  title: string;
  value: string;
  color: string;
  description: string;
}) {
  return (
    <View style={styles.insightCard}>
      <View style={[styles.insightIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.insightContent}>
        <Text style={styles.insightTitle}>{title}</Text>
        <Text style={[styles.insightValue, { color }]}>{value}</Text>
        <Text style={styles.insightDesc}>{description}</Text>
      </View>
    </View>
  );
}

function SimpleChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const maxValue = Math.max(...data, 1);
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1 || 1)) * CHART_WIDTH,
    y: CHART_HEIGHT - (value / maxValue) * CHART_HEIGHT,
    value,
  }));

  return (
    <View style={styles.chart}>
      <View style={styles.chartArea}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <View
            key={ratio}
            style={[
              styles.gridLine,
              { top: ratio * CHART_HEIGHT },
            ]}
          />
        ))}
        {/* Data line */}
        <View style={styles.chartLine}>
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.chartPoint,
                {
                  left: point.x - 4,
                  top: point.y - 4,
                  backgroundColor: color,
                },
              ]}
            />
          ))}
          {/* Connect points */}
          {points.slice(1).map((point, index) => {
            const prevPoint = points[index];
            const distance = Math.sqrt(
              Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
            );
            const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);
            return (
              <View
                key={index}
                style={[
                  styles.chartLineSegment,
                  {
                    left: prevPoint.x,
                    top: prevPoint.y,
                    width: distance,
                    backgroundColor: color,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
      <Text style={styles.chartLabel}>{label}</Text>
    </View>
  );
}

function getMostCommonEmotion(data: MoodData[]): string {
  const counts: Record<string, number> = {};
  data.forEach((d) => {
    counts[d.emotion] = (counts[d.emotion] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
}

function generateSampleData(): MoodData[] {
  const emotions = ['stressed', 'tired', 'neutral', 'energetic', 'calm'];
  const days = 7;
  const data: MoodData[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date,
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      energyLevel: 0.3 + Math.random() * 0.5,
      stressLevel: 0.2 + Math.random() * 0.6,
    });
  }
  return data;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  currentMoodSection: {
    marginBottom: 24,
  },
  currentMoodCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  moodIndicator: {
    alignItems: 'center',
    marginBottom: 20,
  },
  moodEmotion: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    textTransform: 'capitalize',
  },
  moodBars: {
    gap: 16,
  },
  moodBarContainer: {
    marginBottom: 12,
  },
  moodBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  moodBarLabel: {
    flex: 1,
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  moodBarValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  moodBar: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  insightDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  chartContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  chart: {
    alignItems: 'center',
  },
  chartArea: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#334155',
    opacity: 0.3,
  },
  chartLine: {
    position: 'absolute',
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
  },
  chartPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartLineSegment: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  chartLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  moodCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  moodDay: {
    alignItems: 'center',
    gap: 8,
  },
  moodDayLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  moodDayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodDayEmotion: {
    fontSize: 9,
    color: '#E2E8F0',
    textTransform: 'capitalize',
    maxWidth: 50,
    textAlign: 'center',
  },
});

