// Custom hook for consistent error handling

import { useCallback } from 'react';
import { useToast } from '../components/ui/use-toast';
import { ApiError } from '../types';

interface ErrorHandlerOptions {
  defaultMessage?: string;
  showToast?: boolean;
  logError?: boolean;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: unknown, options: ErrorHandlerOptions = {}) => {
      const {
        defaultMessage = 'An error occurred',
        showToast = true,
        logError = true,
      } = options;

      let errorMessage = defaultMessage;
      let errorDetails: any = null;

      // Extract error message based on error type
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        const apiError = error as ApiError;
        errorMessage = apiError.message || defaultMessage;
        errorDetails = apiError.details;
      }

      // Log error if enabled
      if (logError) {
        console.error('Error:', errorMessage, errorDetails || error);
      }

      // Show toast if enabled
      if (showToast) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      return { errorMessage, errorDetails };
    },
    [toast]
  );

  return { handleError };
};