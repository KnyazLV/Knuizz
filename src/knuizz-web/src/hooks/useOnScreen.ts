// src/hooks/useOnScreen.ts
import { useState, useEffect, type RefObject } from "react";

// Этот хук отслеживает, появился ли указанный HTML-элемент в области видимости экрана.
export function useOnScreen(ref: RefObject<HTMLElement>): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Как только элемент появляется, обновляем состояние и отключаем наблюдатель
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1, // Сработает, когда хотя бы 10% элемента видно
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Очистка при размонтировании компонента
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isIntersecting;
}
