// src/components/ui/AnimatedHeading.tsx
import { useEffect, useRef } from 'react';
import { Heading } from '@radix-ui/themes';
import type { HeadingProps } from '@radix-ui/themes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const anime: any;

type AnimatedHeadingProps = HeadingProps & {
    text: string;
};

export default function AnimatedHeading({ text, ...props }: AnimatedHeadingProps) {
    const headingRef = useRef<HTMLHeadingElement>(null);

    const animationRef = useRef<ReturnType<typeof anime.timeline> | null>(null);

    useEffect(() => {
        const textWrapper = headingRef.current;
        if (!textWrapper) return;

        textWrapper.innerHTML = textWrapper.textContent!.replace(
            /\S/g,
            "<span class='letter'>$&</span>"
        );

        animationRef.current = anime.timeline({ loop: false })
            .add({
                targets: '.ml2 .letter',
                scale: [4, 1],
                opacity: [0, 1],
                translateZ: 0,
                easing: "easeOutExpo",
                duration: 950,
                delay: (_: HTMLElement, i: number) => 70 * i
            });

        return () => {
            if (animationRef.current) {
                anime.remove(textWrapper.querySelectorAll('.letter'));
            }
        };
    }, [text]);

    return (
        <Heading
            ref={headingRef}
            {...props}
            className={`text-gradient uppercase ml2 ${props.className || ''}`}
        >
            {text}
        </Heading>
    );
}
