// Custom hook for polling functionality

import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval: number;
  enabled?: boolean;
  immediate?: boolean;
  onError?: (error: Error) => void;
}

export const usePolling = (
  callback: () => void | Promise<void>,
  options: UsePollingOptions
) => {
  const { interval, enabled = true, immediate = true, onError } = options;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (intervalRef.current) return;

    const executeCallback = async () => {
      try {
        await callbackRef.current();
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    };

    // Execute immediately if requested
    if (immediate) {
      executeCallback();
    }

    // Set up interval
    intervalRef.current = setInterval(executeCallback, interval);
  }, [interval, immediate, onError]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    stop();
    start();
  }, [start, stop]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [enabled, start, stop]);

  return { start, stop, restart };
};