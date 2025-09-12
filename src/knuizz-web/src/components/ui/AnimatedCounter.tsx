// src/components/ui/AnimatedCounter.tsx
import { useState, useEffect, useRef } from 'react';
import { Heading } from '@radix-ui/themes';
import { useOnScreen } from '../../app/hooks.ts';
import * as React from "react";

type AnimatedCounterProps = {
    endValue: number;
    duration?: number;
};

export default function AnimatedCounter({ endValue, duration = 2000 }: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLHeadingElement>(null);
    const isOnScreen = useOnScreen(ref as React.RefObject<HTMLElement>);

    useEffect(() => {
        if (isOnScreen) {
            let startTime: number | null = null;
            let animationFrameId: number;

            const animate = (timestamp: number) => {
                if (!startTime) {
                    startTime = timestamp;
                }

                const progressRaw = Math.min((timestamp - startTime) / duration, 1);

                const progressEased = progressRaw < 0.5
                    ? 4 * progressRaw * progressRaw * progressRaw
                    : 1 - Math.pow(-2 * progressRaw + 2, 3) / 2;

                const currentValue = Math.floor(progressEased * endValue);
                setCount(currentValue);

                if (progressRaw < 1) {
                    animationFrameId = requestAnimationFrame(animate);
                } else {
                    setCount(endValue);
                }
            };

            animationFrameId = requestAnimationFrame(animate);

            return () => {
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, [isOnScreen, endValue, duration]);

    return (
        <Heading ref={ref} size="8" className="text-[var(--accent-11)] mb-3">
            {count.toLocaleString()}+
        </Heading>
    );
}
