/**
 * Large voice input button component
 * Matches the design from the image
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface VoiceInputButtonProps {
  onRecordingComplete: (uri: string) => void;
  isProcessing?: boolean;
}

export function VoiceInputButton({
  onRecordingComplete,
  isProcessing = false,
}: VoiceInputButtonProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recordingStartTime = useRef<number | null>(null);
  const isStartingRecording = useRef<boolean>(false);
  const shouldStopRef = useRef<boolean>(false);
  const isRecordingRef = useRef<boolean>(false); // Ref to track recording state for interval
  const minRecordingDuration = 1000; // Minimum 1 second to prevent accidental stops
  const maxRecordingDuration = 300000; // Maximum 5 minutes (300 seconds) - allows longer recordings
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      // Stop recording if active
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

  async function requestPermissions() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.error('Failed to get audio permissions', err);
      setHasPermission(false);
    }
  }

  async function startRecording() {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    // Prevent multiple recordings - check both state and recording object
    if (recording || isRecording || isStartingRecording.current) {
      console.log('⚠️ Recording already in progress, skipping...');
      return;
    }

    isStartingRecording.current = true;
    shouldStopRef.current = false;

    try {
      // Ensure no existing recording
      try {
        const status = await Audio.getPermissionsAsync();
        if (!status.granted) {
          await requestPermissions();
          isStartingRecording.current = false;
          return;
        }
      } catch (e) {
        // Continue if permission check fails
      }

      // Set audio mode before creating recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Create new recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
      isRecordingRef.current = true; // Update ref
      recordingStartTime.current = Date.now();
      isStartingRecording.current = false;
      setRecordingDuration(0);
      console.log('✅ Recording started successfully');

      // Start duration tracking - use a more reliable interval
      durationIntervalRef.current = setInterval(() => {
        if (recordingStartTime.current && isRecordingRef.current) {
          const elapsed = Date.now() - recordingStartTime.current;
          setRecordingDuration(elapsed);
          
          // Auto-stop at max duration (5 minutes)
          if (elapsed >= maxRecordingDuration) {
            console.log('⏱️ Maximum recording duration reached (5 minutes), stopping...');
            isRecordingRef.current = false;
            stopRecording();
          }
        } else {
          // Clear interval if recording stopped
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
        }
      }, 250); // Update every 250ms for smooth counter

      // If stop was requested while starting, stop now
      if (shouldStopRef.current) {
        setTimeout(() => {
          stopRecording();
        }, minRecordingDuration);
      }
    } catch (err: any) {
      console.error('❌ Failed to start recording:', err);
      isStartingRecording.current = false;
      shouldStopRef.current = false;
      
      // Clean up on error
      try {
        const currentRecording = recording;
        if (currentRecording) {
          await currentRecording.stopAndUnloadAsync();
        }
      } catch (cleanupErr) {
        // Ignore cleanup errors
      }
      
      // Reset state on error
      setRecording(null);
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    // If recording is still starting, mark that we want to stop
    if (isStartingRecording.current) {
      console.log('⏳ Recording still starting, will stop when ready...');
      shouldStopRef.current = true;
      return;
    }

    // If recording hasn't started yet, just reset state
    if (!recording) {
      setIsRecording(false);
      isRecordingRef.current = false;
      recordingStartTime.current = null;
      shouldStopRef.current = false;
      return;
    }

    // Ensure minimum recording duration has passed
    if (recordingStartTime.current) {
      const recordingDuration = Date.now() - recordingStartTime.current;
      if (recordingDuration < minRecordingDuration) {
        console.log(`⏱️ Recording too short (${recordingDuration}ms), waiting...`);
        // Wait for minimum duration
        setTimeout(() => {
          stopRecording();
        }, minRecordingDuration - recordingDuration);
        return;
      }
    }

    try {
      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      setIsRecording(false);
      isRecordingRef.current = false; // Update ref
      recordingStartTime.current = null;
      shouldStopRef.current = false;
      setRecordingDuration(0);
      
      // Get URI before stopping
      const uri = recording.getURI();
      
      // Stop and unload
      await recording.stopAndUnloadAsync();
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      // Clear recording state
      setRecording(null);

      // Call completion callback
      if (uri) {
        console.log('✅ Recording stopped, processing...');
        onRecordingComplete(uri);
      }
    } catch (err: any) {
      console.error('Failed to stop recording', err);
      // Clear duration interval on error
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      // Reset state even on error
      setRecording(null);
      setIsRecording(false);
      isRecordingRef.current = false;
      recordingStartTime.current = null;
      shouldStopRef.current = false;
      setRecordingDuration(0);
    }
  }

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <View style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#4C1D95', '#6B21A8', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, styles.processingButton]}
          >
            <ActivityIndicator size="large" color="#F3E8FF" />
          </LinearGradient>
        </View>
        <Text style={styles.instructionText}>Processing your thoughts...</Text>
        <Text style={styles.subText}>This may take a few seconds</Text>
      </View>
    );
  }

  // Toggle recording on tap
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.buttonWrapper,
          pressed && styles.buttonPressed
        ]}
        onPress={handleToggleRecording}
        disabled={!hasPermission || isProcessing}
      >
        {isRecording ? (
          <LinearGradient
            colors={['#7C3AED', '#9333EA', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, styles.buttonRecording]}
          >
            <View style={styles.pulseRing} />
            <Ionicons name="mic" size={52} color="#FFFFFF" />
            {/* Duration display on button */}
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.button, styles.buttonIdle]}>
            <Ionicons name="mic" size={52} color="#9CA3AF" />
          </View>
        )}
      </Pressable>
      <Text style={styles.instructionText}>
        {isRecording 
          ? `Tap again to stop • ${formatDuration(recordingDuration)}` 
          : 'Tap to start recording'}
      </Text>
      {isRecording && recordingDuration >= maxRecordingDuration - 10000 && (
        <Text style={styles.warningText}>
          {Math.ceil((maxRecordingDuration - recordingDuration) / 1000)}s remaining
        </Text>
      )}
      {!hasPermission && (
        <Text style={styles.permissionText}>
          Microphone permission required
        </Text>
      )}
    </View>
  );
}

// Helper function to format duration
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 24,
  },
  buttonWrapper: {
    position: 'relative',
  },
  buttonPressed: {
    opacity: 0.95,
  },
  button: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonIdle: {
    backgroundColor: '#1E293B',
    borderWidth: 3,
    borderColor: '#334155',
  },
  buttonRecording: {
    borderWidth: 0,
  },
  processingButton: {
    borderWidth: 0,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  instructionText: {
    marginTop: 20,
    fontSize: 17,
    color: '#F1F5F9',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subText: {
    marginTop: 6,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '400',
  },
  permissionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#F87171',
    fontWeight: '500',
  },
  warningText: {
    marginTop: 4,
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '500',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

