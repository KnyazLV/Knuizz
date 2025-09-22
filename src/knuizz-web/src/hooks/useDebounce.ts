// src/hooks/useDebounce.ts
import { useState, useEffect } from "react";

// Этот хук принимает значение и задержку, и возвращает это значение
// только после того, как оно не менялось в течение указанной задержки.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
