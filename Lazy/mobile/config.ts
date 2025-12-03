/**
 * App Configuration
 */

import { Platform } from 'react-native';

// Backend API URL
// IMPORTANT: For real device testing, you MUST use ngrok or your computer's IP address
// For iOS Simulator: use 'http://localhost:8000'
// For Android Emulator: use 'http://10.0.2.2:8000'
// For Real Device: use ngrok URL (e.g., 'https://abc123.ngrok-free.dev')

// Ngrok URL for real device testing
// Update this when you restart ngrok (run: cd backend && ./get-ngrok-url.sh)
const NGROK_URL = 'https://delinda-pseudohermaphroditic-naomi.ngrok-free.dev';

// Set to true if testing on REAL DEVICE (not simulator/emulator)
// Set to false if testing on iOS Simulator or Android Emulator
const USE_NGROK_FOR_ALL = true; // Change to false for simulator/emulator testing

// Auto-detect platform and return appropriate URL
const getBaseURL = () => {
  if (__DEV__) {
    // If USE_NGROK_FOR_ALL is true, always use ngrok (for real devices)
    if (USE_NGROK_FOR_ALL) {
      return NGROK_URL;
    }
    
    // Otherwise, use local URLs for simulators/emulators
    if (Platform.OS === 'ios') {
      return 'http://localhost:8000'; // iOS Simulator
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000'; // Android Emulator
    }
    
    // Fallback to ngrok
    return NGROK_URL;
  }
  return 'https://your-production-api.com';
};

export const API_BASE_URL = getBaseURL();

export const API_ENDPOINTS = {
  PROCESS_VOICE: `${API_BASE_URL}/api/v1/process-voice-input`,
  PROCESS_TEXT: `${API_BASE_URL}/api/v1/process-text-input`,
  TASKS: `${API_BASE_URL}/api/v1/tasks`,
  TASK: (id: string) => `${API_BASE_URL}/api/v1/tasks/${id}`,
  TASK_COMPLETE: (id: string) => `${API_BASE_URL}/api/v1/tasks/${id}/complete`,
  TASK_DELETE: (id: string) => `${API_BASE_URL}/api/v1/tasks/${id}`,
  PROACTIVE_SUGGESTIONS: `${API_BASE_URL}/api/v1/proactive-suggestions`,
  MARK_SUGGESTION_SHOWN: (id: string) => `${API_BASE_URL}/api/v1/proactive-suggestions/${id}/mark-shown`,
  PLAN_ROUTE: `${API_BASE_URL}/api/v1/plan-route`,
};

// Helper to check if we're on a real device
export const IS_REAL_DEVICE = Platform.OS !== 'web' && !__DEV__;

// Log the API URL for debugging
if (__DEV__) {
  console.log('═══════════════════════════════════════');
  console.log('🔗 API Configuration:');
  console.log('   Base URL:', API_BASE_URL);
  console.log('   Platform:', Platform.OS);
  console.log('   Using Ngrok:', USE_NGROK_FOR_ALL);
  console.log('   Ngrok URL:', NGROK_URL);
  console.log('═══════════════════════════════════════');
}
