import { Text } from "@radix-ui/themes";
import React from "react";
import { FloatingElementType } from "@/shared/types/FloatingElementType.ts";

import bookIcon from "../../shared/assets/icons/book.png";
import brainIcon from "../../shared/assets/icons/brain.png";
import cupIcon from "../../shared/assets/icons/cup.png";
import flaskIcon from "../../shared/assets/icons/flask.png";
import globeIcon from "../../shared/assets/icons/globe.png";
import musicIcon from "../../shared/assets/icons/music.png";
import puzzleIcon from "../../shared/assets/icons/puzzle.png";

const iconMap = {
  [FloatingElementType.Book]: bookIcon,
  [FloatingElementType.Brain]: brainIcon,
  [FloatingElementType.Cup]: cupIcon,
  [FloatingElementType.Flask]: flaskIcon,
  [FloatingElementType.Globe]: globeIcon,
  [FloatingElementType.Music]: musicIcon,
  [FloatingElementType.Puzzle]: puzzleIcon,
};

type FloatingElementProps = {
  type: FloatingElementType;
  size?: string;
  top?: string;
  left?: string;
  right?: string;
  rotation?: number;
  floatDuration?: string;
  opacity?: number;
};

export default function FloatingElement({
  type,
  size = "4rem",
  top,
  left,
  right,
  rotation = 0,
  floatDuration = "8s",
  opacity = 0.1,
}: FloatingElementProps) {
  const isQuestionMark = type === FloatingElementType.QuestionMark;

  const style = {
    "--initial-rotation": `${rotation}deg`,
    position: "absolute",
    top,
    left,
    right,
    width: size,
    height: size,
    zIndex: 0,
    animation: `float ${floatDuration} ease-in-out infinite`,
    userSelect: "none",
  } as any as React.CSSProperties;

  if (isQuestionMark) {
    return (
      <div style={style}>
        <Text as="div" style={{ fontSize: size, color: "var(--slate-a5)" }}>
          ?
        </Text>
      </div>
    );
  }

  const iconStyle = { ...style, opacity };

  return (
    <div style={iconStyle}>
      <img
        src={iconMap[type]}
        alt="floating icon"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
