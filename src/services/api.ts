import { MindMapData } from '../components/MindMap/types';
import { getAccessToken } from './supabase';

// Update the endpoint to match the deployed function path
const SUPABASE_FUNCTION_URL = 'https://mgmpmqvoyosvydaeeabq.supabase.co/functions/v1/mindmap';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiService {
  static async generateMindMap(topic: string): Promise<MindMapData> {
    try {
      console.log('Generating mind map for topic:', topic);
      
      const accessToken = await getAccessToken();
      if (!accessToken) {
        console.error('Authentication error: No access token available');
        throw new Error('Not authenticated - please sign in');
      }

      console.log('Making request to:', SUPABASE_FUNCTION_URL);
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };

      console.log('Request headers:', {
        ...headers,
        'Authorization': 'Bearer [REDACTED]'
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ topic }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 404) {
          console.error('Supabase request failed', {
            url: SUPABASE_FUNCTION_URL,
            status: response.status,
            body: errorText
          });
          throw new Error('Service unavailable - please try again later');
        }

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || `HTTP ${response.status} Error`);
        } catch {
          throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to generate mind map');
      }

      return result.data;
    } catch (error) {
      console.error('Full error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      throw error instanceof Error ?
        error :
        new Error('Failed to generate mind map: Unknown error occurred');
    }
  }
}