import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { azureOpenAI, ChatMessage, StreamChunk, QuotaInfo } from '@/lib/azure-openai';
import { useAuth } from '@/contexts/AuthContext';

interface UseAzureOpenAIOptions {
  onStreamChunk?: (chunk: StreamChunk) => void;
  onComplete?: (response: string) => void;
  onError?: (error: Error) => void;
}

export function useAzureOpenAI(options: UseAzureOpenAIOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const { user } = useAuth();

  // Fetch quota status on mount and after each request
  const fetchQuotaStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      const quotaInfo = await azureOpenAI.getQuotaStatus();
      setQuota(quotaInfo);
    } catch (error) {
      console.error('Failed to fetch quota status:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchQuotaStatus();
  }, [fetchQuotaStatus]);

  const sendMessage = useCallback(async (
    messages: ChatMessage[],
    {
      temperature = 0.7,
      maxTokens = 2000,
      topP = 0.95,
      frequencyPenalty = 0,
      presencePenalty = 0,
      stream = true,
      model = 'gpt-3.5-turbo',
    } = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let accumulatedContent = '';

      const response = await azureOpenAI.createChatCompletion({
        messages,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        presencePenalty,
        stream,
        model,
        onChunk: stream ? (chunk) => {
          if (chunk.choices[0]?.delta?.content) {
            accumulatedContent += chunk.choices[0].delta.content;
          }
          options.onStreamChunk?.(chunk);
        } : undefined,
      });

      if (!stream && response.choices[0]?.message?.content) {
        accumulatedContent = response.choices[0].message.content;
      }

      // Refresh quota after successful request
      await fetchQuotaStatus();

      options.onComplete?.(accumulatedContent);
      return accumulatedContent;
    } catch (err) {
      const error = err as Error & { code?: string; details?: string; quotaStatus?: any; upgradeUrl?: string };
      setError(error);
      
      // Handle quota exceeded error
      if (error.code === 'QUOTA_EXCEEDED') {
        if (error.quotaStatus) {
          setQuota({
            used: error.quotaStatus.used.daily,
            limit: error.quotaStatus.limits.daily,
            resetDate: error.quotaStatus.resetAt.daily,
          });
        }
        
        toast.error("Quota Exceeded", {
          description: error.details || "You've reached your monthly limit. Please upgrade your plan to continue.",
          action: {
            label: "Upgrade",
            onClick: () => {
              // Navigate to upgrade page
              window.location.href = error.upgradeUrl || '/profile?tab=subscription';
            }
          }
        });
      } else {
        toast.error("Error", {
          description: error.message || "Failed to process your request",
        });
      }
      
      options.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [options, fetchQuotaStatus]);

  const calculateQuotaPercentage = useCallback(() => {
    if (!quota) return 0;
    return Math.round((quota.used / quota.limit) * 100);
  }, [quota]);

  const isQuotaExceeded = useCallback(() => {
    if (!quota) return false;
    return quota.used >= quota.limit;
  }, [quota]);

  return {
    sendMessage,
    isLoading,
    error,
    quota,
    quotaPercentage: calculateQuotaPercentage(),
    isQuotaExceeded: isQuotaExceeded(),
    refreshQuota: fetchQuotaStatus,
  };
}