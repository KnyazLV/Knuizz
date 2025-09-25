import { useEffect, useRef } from "react";
import { Heading } from "@radix-ui/themes";
import type { HeadingProps } from "@radix-ui/themes";
import { useWindowWidth } from "@/hooks/useWindowWidth.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const anime: any;

type AnimatedHeadingProps = HeadingProps & {
  text: string;
};

export default function AnimatedHeading({
  text,
  ...props
}: AnimatedHeadingProps) {
  const width = useWindowWidth();
  const isMobile = width < 940;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const animationRef = useRef<ReturnType<typeof anime.timeline> | null>(null);

  useEffect(() => {
    const textWrapper = headingRef.current;
    if (!textWrapper) return;

    const words = textWrapper.textContent!.split(" ");

    textWrapper.innerHTML = words
      .map(
        (word) =>
          `<span class="word">${[...word]
            .map((letter) => `<span class="letter">${letter}</span>`)
            .join("")}</span>`,
      )
      .join(" ");

    animationRef.current = anime.timeline({ loop: false }).add({
      targets: ".ml2 .letter",
      scale: isMobile ? [2, 1] : [4, 1],
      opacity: [0, 1],
      translateZ: 0,
      easing: "easeOutExpo",
      duration: isMobile ? 600 : 950,
      delay: (_: HTMLElement, i: number) => (isMobile ? 40 : 70) * i,
    });

    return () => {
      if (animationRef.current) {
        anime.remove(textWrapper.querySelectorAll(".letter"));
      }
    };
  }, [text, isMobile]);

  return (
    <Heading
      ref={headingRef}
      {...props}
      className={`text-gradient ml2 uppercase ${props.className || ""}`}
      style={{
        fontSize: isMobile
          ? "2rem"
          : props.size
            ? `var(--font-size-${props.size})`
            : undefined,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        textAlign: props.align || "center",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        marginTop: props.mt,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        marginBottom: props.mb,
      }}
    >
      {text}
    </Heading>
  );
}
