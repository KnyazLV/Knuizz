import { Flex, Text } from "@radix-ui/themes";

interface AccuracyDonutChartProps {
  accuracy: number;
  size?: number;
}

export default function DonutChart({
  accuracy,
  size = 80,
}: AccuracyDonutChartProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (accuracy / 100) * circumference;

  return (
    <Flex
      align="center"
      justify="center"
      style={{ width: size, height: size, position: "relative" }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          stroke="var(--gray-a5)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="var(--accent-a11)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 0.5s ease-out",
          }}
        />
      </svg>
      <Text
        align="center"
        size="5"
        weight="bold"
        style={{ position: "absolute" }}
      >
        {Math.round(accuracy)}%
      </Text>
    </Flex>
  );
}
