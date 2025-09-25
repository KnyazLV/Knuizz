import React, { useRef, type ReactNode, type CSSProperties } from "react";
import { useOnScreen } from "@/hooks/useOnScreen.ts";

type AnimatedOnScrollProps = {
  children: ReactNode;
  animationName?: string;
  delay?: string;
  duration?: string;
  className?: string;
};

export default function AnimatedWhenNotice({
  children,
  animationName = "fadeInUp",
  delay = "0s",
  duration = "1s",
  className = "",
}: AnimatedOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isOnScreen = useOnScreen(ref as React.RefObject<HTMLElement>);

  const style: CSSProperties = {
    "--animate-delay": delay,
    "--animate-duration": duration,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={`${className} ${isOnScreen ? `animate__animated animate__${animationName}` : "opacity-0"}`}
      style={style}
    >
      {children}
    </div>
  );
}
