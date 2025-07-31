// Custom hook for auto-scrolling to bottom functionality

import { useEffect, useCallback, RefObject } from 'react';

export const useScrollToBottom = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  dependencies: any[] = []
) => {
  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [ref]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, ...dependencies]);

  return scrollToBottom;
};