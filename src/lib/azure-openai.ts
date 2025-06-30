import { apiClient } from '@/lib/api';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason?: string;
  }>;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  model?: string;
  onChunk?: (chunk: StreamChunk) => void;
}

export interface QuotaInfo {
  used: number;
  limit: number;
  resetDate: string;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  _metadata?: {
    cost: string;
    cost_millicents: number;
    tier: string;
    region: string;
    response_time_ms: number;
  };
}

export class AzureOpenAIClient {
  private edgeFunctionUrl: string;

  constructor() {
    const apiUrl = import.meta.env?.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('API URL is not configured');
    }
    this.edgeFunctionUrl = `${apiUrl}/ai/chat-completion`;
  }

  async createChatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const {
      messages,
      temperature = 0.7,
      maxTokens = 2000,
      topP = 0.95,
      frequencyPenalty = 0,
      presencePenalty = 0,
      stream = false,
      model = 'gpt-3.5-turbo',
      onChunk
    } = options;

    // Get the auth token from localStorage (our new auth approach)
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User is not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const body = {
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream,
      model,
    };

    if (stream && onChunk) {
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error cases
        if (response.status === 429) {
          // Rate limit or quota exceeded
          const error = new Error(errorData.error || 'Rate limit exceeded');
          (error as any).code = 'QUOTA_EXCEEDED';
          (error as any).details = errorData.details;
          (error as any).quotaStatus = errorData.quotaStatus;
          (error as any).upgradeUrl = errorData.upgradeUrl;
          throw error;
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const chunk = JSON.parse(data);
              onChunk(chunk);
            } catch (e) {
              console.error('Error parsing SSE chunk:', e);
            }
          }
        }
      }

      // Return a completion response (this is a placeholder as streaming doesn't return a standard response)
      return {
        choices: [{
          message: {
            role: 'assistant',
            content: 'Streaming response completed',
          },
          finish_reason: 'stop',
        }],
      };
    } else {
      const response = await fetch(this.edgeFunctionUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle specific error cases
        if (response.status === 429) {
          // Rate limit or quota exceeded
          const error = new Error(errorData.error || 'Rate limit exceeded');
          (error as any).code = 'QUOTA_EXCEEDED';
          (error as any).details = errorData.details;
          (error as any).quotaStatus = errorData.quotaStatus;
          (error as any).upgradeUrl = errorData.upgradeUrl;
          throw error;
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    }
  }

  async getQuotaStatus(): Promise<QuotaInfo> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('User is not authenticated');
    }

    try {
      // TODO: Implement quota status via our new API
      // For now, return mock data to allow the app to build
      const tier = 'free';
      const dailyUsage = 0;
      const dailyLimit = 100;

      // Calculate reset date (next day at midnight)
      const resetDate = new Date();
      resetDate.setDate(resetDate.getDate() + 1);
      resetDate.setHours(0, 0, 0, 0);

      return {
        used: dailyUsage,
        limit: dailyLimit,
        resetDate: resetDate.toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch quota status:', error);
      // Return default values on error
      const resetDate = new Date();
      resetDate.setDate(resetDate.getDate() + 1);
      resetDate.setHours(0, 0, 0, 0);
      
      return {
        used: 0,
        limit: 100,
        resetDate: resetDate.toISOString(),
      };
    }
  }
}

// Export a singleton instance
export const azureOpenAI = new AzureOpenAIClient();