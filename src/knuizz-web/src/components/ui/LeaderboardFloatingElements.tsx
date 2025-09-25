import { FloatingElementType } from "@/shared/types/FloatingElementType.ts";
import FloatingElement from "@/components/ui/FloatingElement.tsx";

const floatingElementsConfig = [
  {
    type: FloatingElementType.Cup,
    size: "6rem",
    top: "12%",
    left: "4%",
    rotation: -15,
    floatDuration: "10s",
    opacity: 0.08,
  },
  {
    type: FloatingElementType.Globe,
    size: "4rem",
    top: "75%",
    left: "10%",
    rotation: 20,
    floatDuration: "8s",
    opacity: 0.06,
  },
  {
    type: FloatingElementType.Book,
    size: "7rem",
    top: "20%",
    right: "5%",
    rotation: 10,
    floatDuration: "12s",
    opacity: 0.09,
  },
  {
    type: FloatingElementType.Music,
    size: "4rem",
    top: "60%",
    right: "7%",
    rotation: 10,
    floatDuration: "14s",
    opacity: 0.09,
  },
  {
    type: FloatingElementType.Puzzle,
    size: "3.5rem",
    top: "85%",
    right: "12%",
    rotation: -25,
    floatDuration: "9s",
    opacity: 0.07,
  },
  {
    type: FloatingElementType.Brain,
    size: "5rem",
    top: "50%",
    left: "15%",
    rotation: 5,
    floatDuration: "11s",
    opacity: 0.08,
  },
  {
    type: FloatingElementType.Flask,
    size: "4.5rem",
    top: "80%",
    right: "50%",
    rotation: 15,
    floatDuration: "7s",
    opacity: 0.07,
  },
];

export default function LeaderboardFloatingElements() {
  return (
    <div
      className="absolute pointer-events-none z-0"
      style={{ top: 0, bottom: 0, left: 0, right: 0 }}
    >
      <div
        className="animate__animated animate__fadeIn"
        style={{ animationDelay: "1.2s" }}
      >
        {floatingElementsConfig.map((props, index) => (
          <FloatingElement key={index} {...props} />
        ))}
      </div>
    </div>
  );
}
