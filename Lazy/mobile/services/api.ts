/**
 * API Service for communicating with the backend
 */

import axios from 'axios';
import { API_ENDPOINTS } from '../config';
import { VoiceProcessingResponse, Task } from '../types';

/**
 * Process voice input by uploading audio file
 */
export async function processVoiceInput(
  audioUri: string
): Promise<VoiceProcessingResponse> {
  try {
    console.log('🎤 Processing voice input from:', audioUri);
    console.log('📡 Sending to:', API_ENDPOINTS.PROCESS_VOICE);
    
    // Create form data for file upload
    const formData = new FormData();
    const filename = audioUri.split('/').pop() || 'audio.m4a';
    const fileType = filename.endsWith('.m4a') 
      ? 'audio/m4a' 
      : filename.endsWith('.mp3')
      ? 'audio/mp3'
      : 'audio/wav';

    // Append file to form data
    formData.append('audio_file', {
      uri: audioUri,
      type: fileType,
      name: filename,
    } as any);

    // Make API call
    console.log('⏳ Sending request to backend...');
    const response = await axios.post<VoiceProcessingResponse>(
      API_ENDPOINTS.PROCESS_VOICE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
        timeout: 30000, // 30 second timeout for AI processing
      }
    );

    console.log('✅ Voice processing successful!');
    return response.data;
  } catch (error: any) {
    console.error('Error processing voice input:', error);
    
    // Better error messages
    let errorMessage = 'Failed to process voice input';
    
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      errorMessage = 'Cannot connect to server. Make sure the backend is running and check your network connection.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Get all tasks
 */
export async function getTasks(): Promise<Task[]> {
  try {
    console.log('📡 Fetching tasks from:', API_ENDPOINTS.TASKS);
    const response = await axios.get<Task[]>(API_ENDPOINTS.TASKS, {
      headers: {
        'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
      },
      timeout: 10000, // 10 second timeout
    });
    console.log('✅ Tasks fetched successfully:', response.data.length);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    
    let errorMessage = 'Failed to fetch tasks';
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      errorMessage = 'Cannot connect to server. Make sure the backend is running.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Process text input by sending text to backend
 */
export async function processTextInput(
  text: string
): Promise<VoiceProcessingResponse> {
  try {
    console.log('📝 Processing text input:', text.substring(0, 50) + '...');
    console.log('📡 Sending to:', API_ENDPOINTS.PROCESS_TEXT);
    
    const response = await axios.post<VoiceProcessingResponse>(
      API_ENDPOINTS.PROCESS_TEXT,
      { text: text.trim() }, // Ensure text is trimmed
      {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        timeout: 30000, // 30 second timeout for AI processing
      }
    );

    console.log('✅ Text processing successful!');
    return response.data;
  } catch (error: any) {
    console.error('Error processing text input:', error);
    
    let errorMessage = 'Failed to process text input';
    
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      errorMessage = 'Cannot connect to server. Make sure the backend is running and check your network connection.';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Mark a task as complete
 */
export async function completeTask(taskId: string): Promise<Task> {
  try {
    const response = await axios.post<Task>(
      API_ENDPOINTS.TASK_COMPLETE(taskId),
      {},
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error completing task:', error);
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to complete task'
    );
  }
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    await axios.delete(
      API_ENDPOINTS.TASK_DELETE(taskId),
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );
    console.log('✅ Task deleted successfully');
  } catch (error: any) {
    console.error('Error deleting task:', error);
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to delete task'
    );
  }
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
  }
): Promise<Task> {
  try {
    const response = await axios.patch<Task>(
      API_ENDPOINTS.TASK(taskId),
      updates,
      {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating task:', error);
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to update task'
    );
  }
}

