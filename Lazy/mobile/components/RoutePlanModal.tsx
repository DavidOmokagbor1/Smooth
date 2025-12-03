/**
 * Route Plan Modal Component
 * Displays optimized route for errands with calendar, map, and notes
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
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoutePlan, RouteStop } from '../services/api';
import * as Calendar from 'expo-calendar';

interface RoutePlanModalProps {
  visible: boolean;
  routePlan: RoutePlan | null;
  onClose: () => void;
  onOpenInMaps?: (route: RouteStop[]) => void;
}

export function RoutePlanModal({
  visible,
  routePlan,
  onClose,
  onOpenInMaps,
}: RoutePlanModalProps) {
  const [notes, setNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [savingToCalendar, setSavingToCalendar] = useState(false);

  if (!routePlan) return null;

  // Ensure route array exists (defensive check)
  const route = routePlan.route || [];
  const taskCount = routePlan.task_count || 0;
  const totalDistance = routePlan.total_distance_km || 0;
  const estimatedTime = routePlan.estimated_time_minutes || 0;

  // Format time nicely
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Open in Maps app
  const handleOpenInMaps = async () => {
    if (route.length === 0) return;
    
    try {
      // Limit waypoints to avoid URL length issues (Google Maps has limits)
      const maxWaypoints = 10;
      const routeStops = route.slice(0, maxWaypoints);
      
      // Build Google Maps URL with waypoints
      // Use coordinates if available, otherwise use location names
      const waypoints: string[] = [];
      
      for (const stop of routeStops) {
        if (stop.coordinates && stop.coordinates.length === 2) {
          // Use coordinates (most reliable)
          waypoints.push(`${stop.coordinates[0]},${stop.coordinates[1]}`);
        } else if (stop.location) {
          // Use location name as fallback
          waypoints.push(encodeURIComponent(stop.location));
        }
      }

      if (waypoints.length === 0) {
        Alert.alert('No Locations', 'Route locations are not available for mapping.');
        return;
      }

      // Build URL - use first as start, rest as waypoints
      let mapsUrl: string;
      if (waypoints.length === 1) {
        // Single location - just show it
        mapsUrl = `https://www.google.com/maps/search/?api=1&query=${waypoints[0]}`;
      } else {
        // Multiple locations - create route
        const start = waypoints[0];
        const waypointsList = waypoints.slice(1).join('/');
        mapsUrl = `https://www.google.com/maps/dir/${start}/${waypointsList}`;
      }

      // Check if URL can be opened
      const canOpen = await Linking.canOpenURL(mapsUrl);
      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        // Fallback: try with maps:// protocol (iOS)
        const mapsProtocolUrl = mapsUrl.replace('https://www.google.com/maps', 'maps');
        try {
          await Linking.openURL(mapsProtocolUrl);
        } catch {
          Alert.alert(
            'Maps Not Available',
            'Could not open Maps app. Please install Google Maps or Apple Maps.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      console.error('Error opening maps:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to open Maps app. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Save to Calendar
  const handleSaveToCalendar = async () => {
    if (route.length === 0) {
      Alert.alert('No Route', 'Cannot save an empty route to calendar.');
      return;
    }

    try {
      setSavingToCalendar(true);
      
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Calendar access is needed to save your route. Please enable it in Settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get default calendar
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find(c => c.allowsModifications) || calendars[0];

      if (!defaultCalendar) {
        Alert.alert('Error', 'No calendar available. Please set up a calendar first.');
        return;
      }

      // Create calendar event
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + estimatedTime * 60 * 1000);

      // Get device timezone (expo-calendar doesn't accept 'local' string)
      const deviceTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const eventDetails: any = {
        title: `Errand Route: ${taskCount} stops`,
        startDate: startDate,
        endDate: endDate,
        timeZone: deviceTimeZone,
        notes: `Optimized route for ${taskCount} errands.\n\n` +
               `Total distance: ${totalDistance} km\n` +
               `Estimated time: ${formatTime(estimatedTime)}\n\n` +
               `Route:\n${route.map((stop, i) => `${i + 1}. ${stop.title}${stop.location ? ` - ${stop.location}` : ''}`).join('\n')}` +
               (notes ? `\n\nNotes:\n${notes}` : ''),
        location: route.map(s => s.location).filter(Boolean).join(' → '),
        calendarId: defaultCalendar.id,
      };

      await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
      
      Alert.alert(
        'Saved to Calendar!',
        `Your route has been saved to ${defaultCalendar.title}.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error saving to calendar:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to save route to calendar. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSavingToCalendar(false);
    }
  };

  // Save notes
  const handleSaveNotes = () => {
    // In a real app, this would save to backend/database
    // For now, just show confirmation
    Alert.alert('Notes Saved', 'Your route notes have been saved.', [{ text: 'OK' }]);
    setShowNotesInput(false);
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
              <Ionicons name="map" size={24} color="#4DABF7" />
              <Text style={styles.title}>Your Errand Route</Text>
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
            {/* Route Summary - Clear and Comprehensive */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Route Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: '#4DABF720' }]}>
                    <Ionicons name="location" size={20} color="#4DABF7" />
                  </View>
                  <Text style={styles.summaryValue}>{taskCount}</Text>
                  <Text style={styles.summaryLabel}>Stops</Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: '#10B98120' }]}>
                    <Ionicons name="navigate" size={20} color="#10B981" />
                  </View>
                  <Text style={styles.summaryValue}>{totalDistance.toFixed(1)}</Text>
                  <Text style={styles.summaryLabel}>km</Text>
                </View>
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: '#F59E0B20' }]}>
                    <Ionicons name="time" size={20} color="#F59E0B" />
                  </View>
                  <Text style={styles.summaryValue}>{formatTime(estimatedTime)}</Text>
                  <Text style={styles.summaryLabel}>Total Time</Text>
                </View>
              </View>
            </View>

            {/* Route Steps or Message */}
            {!routePlan.optimized || route.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="information-circle-outline" size={48} color="#64748B" />
                <Text style={styles.emptyStateTitle}>Route Not Available</Text>
                <Text style={styles.emptyStateText}>
                  {routePlan.message || 'Need at least 2 tasks with locations to plan a route'}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.routeHeader}>
                  <Text style={styles.routeTitle}>Your Route (Optimized Order)</Text>
                  <Text style={styles.routeSubtitle}>
                    Follow this order to save time and fuel
                  </Text>
                </View>

                {route.map((stop, index) => (
                  <View key={stop.task_id} style={styles.routeItem}>
                    <View style={styles.routeItemContent}>
                      {/* Step Number */}
                      <View style={[styles.stepNumber, { backgroundColor: getPriorityColor(stop.priority) + '20' }]}>
                        <Text style={[styles.stepNumberText, { color: getPriorityColor(stop.priority) }]}>
                          {index + 1}
                        </Text>
                      </View>

                      {/* Task Info */}
                      <View style={styles.taskInfo}>
                        <Text style={styles.taskTitle}>{stop.title}</Text>
                        {stop.location && (
                          <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color="#94A3B8" />
                            <Text style={styles.locationText}>{stop.location}</Text>
                          </View>
                        )}
                        <View style={styles.taskMeta}>
                          {index > 0 && stop.distance_from_previous_km > 0 && (
                            <View style={styles.metaItem}>
                              <Ionicons name="navigate-outline" size={12} color="#64748B" />
                              <Text style={styles.metaText}>
                                {stop.distance_from_previous_km.toFixed(1)} km away
                              </Text>
                            </View>
                          )}
                          {stop.estimated_duration_minutes > 0 && (
                            <View style={styles.metaItem}>
                              <Ionicons name="time-outline" size={12} color="#64748B" />
                              <Text style={styles.metaText}>
                                ~{stop.estimated_duration_minutes} min
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                    {index < route.length - 1 && (
                      <View style={styles.connector}>
                        <Ionicons name="arrow-down" size={16} color="#475569" />
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* Notes Section */}
            {route.length > 0 && (
              <View style={styles.notesSection}>
                <TouchableOpacity
                  style={styles.notesHeader}
                  onPress={() => setShowNotesInput(!showNotesInput)}
                >
                  <Ionicons name="document-text-outline" size={18} color="#94A3B8" />
                  <Text style={styles.notesHeaderText}>
                    {showNotesInput ? 'Hide Notes' : 'Add Notes'}
                  </Text>
                </TouchableOpacity>
                {showNotesInput && (
                  <View style={styles.notesInputContainer}>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Add notes about this route (e.g., parking tips, store hours)..."
                      placeholderTextColor="#64748B"
                      multiline
                      value={notes}
                      onChangeText={setNotes}
                      textAlignVertical="top"
                    />
                    <TouchableOpacity
                      style={styles.saveNotesButton}
                      onPress={handleSaveNotes}
                    >
                      <Text style={styles.saveNotesButtonText}>Save Notes</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {route.length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleOpenInMaps}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Open in Maps</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.calendarButton]}
                  onPress={handleSaveToCalendar}
                  activeOpacity={0.8}
                  disabled={savingToCalendar}
                >
                  <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>
                    {savingToCalendar ? 'Saving...' : 'Save to Calendar'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity
              style={styles.closeButtonAction}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return '#FF6B6B';
    case 'high':
      return '#FFA94D';
    case 'medium':
      return '#4DABF7';
    default:
      return '#9775FA';
  }
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
    gap: 10,
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
  summaryCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  routeHeader: {
    marginBottom: 16,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  routeSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
  },
  routeItem: {
    marginBottom: 12,
  },
  routeItemContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 6,
    lineHeight: 22,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
  },
  connector: {
    alignItems: 'center',
    marginLeft: 18,
    marginTop: 4,
    marginBottom: 4,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  notesSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  notesHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
  notesInputContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
  },
  notesInput: {
    backgroundColor: '#1A1F2E',
    borderRadius: 8,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 14,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#2A2F3E',
  },
  saveNotesButton: {
    backgroundColor: '#4DABF7',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveNotesButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actions: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2F3E',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#4DABF7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calendarButton: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButtonAction: {
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
