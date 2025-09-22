import { useState, useEffect } from "react";

interface AnimatedNumberProps {
  to: number;
  from: number;
  duration?: number;
}

export default function AnimatedNumber({
  to,
  from,
  duration = 1000,
}: AnimatedNumberProps) {
  const [currentNumber, setCurrentNumber] = useState(from);

  useEffect(() => {
    if (from === to) {
      setCurrentNumber(to);
      return;
    }

    const range = to - from;
    const stepTime = Math.abs(Math.floor(duration / range));

    const timer = setInterval(() => {
      setCurrentNumber((prevNumber) => {
        const nextNumber = prevNumber + 1;
        if (nextNumber >= to) {
          clearInterval(timer);
          return to;
        }
        return nextNumber;
      });
    }, stepTime);

    return () => clearInterval(timer);
  }, [to, from, duration]);

  return <span>{currentNumber}</span>;
}
