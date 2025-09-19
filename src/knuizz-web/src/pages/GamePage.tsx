// src/pages/GamePage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { answerQuestion, resetGame } from "../features/game/gameSlice";
import { Box, Heading, Button, Flex, Text, Progress } from "@radix-ui/themes";
import GameSummary from "../components/feature/game/GameSummary.tsx";

export default function GamePage() {
  const dispatch = useDispatch();
  const {
    gameId,
    questions,
    currentQuestionIndex,
    gameStatus,
    score,
    timePerQuestion,
  } = useSelector((state: RootState) => state.game);

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null,
  );
  const [isRevealing, setIsRevealing] = useState(false);
  const [progress, setProgress] = useState(100);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  const questionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setGameStartTime(Date.now());
  }, []);

  useEffect(() => {
    setIsRevealing(false);
    setProgress(100);

    const startTime = Date.now();
    questionIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = 100 - (elapsed / (timePerQuestion * 1000)) * 100;

      if (newProgress <= 0) {
        setProgress(0);
        setIsRevealing(true);
        setSelectedAnswerIndex(null);
        if (questionIntervalRef.current)
          clearInterval(questionIntervalRef.current);
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => {
      if (questionIntervalRef.current)
        clearInterval(questionIntervalRef.current);
    };
  }, [currentQuestionIndex, timePerQuestion]);

  useEffect(() => {
    if (!isRevealing) return;

    const revealTimer = setTimeout(() => {
      dispatch(answerQuestion({ answerIndex: selectedAnswerIndex ?? -1 }));
    }, 1500);

    return () => clearTimeout(revealTimer);
  }, [isRevealing, selectedAnswerIndex, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetGame());
    };
  }, [dispatch]);

  const handleAnswerClick = (index: number) => {
    if (isRevealing) return;

    if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);
    setSelectedAnswerIndex(index);
    setIsRevealing(true);
  };

  if (gameStatus === "finished") {
    const durationInSeconds = gameStartTime
      ? Math.round((Date.now() - gameStartTime) / 1000)
      : 0;
    return (
      <GameSummary
        score={score}
        totalQuestions={questions.length}
        durationSeconds={durationInSeconds}
      />
    );
    // return <GameSummary score={score} totalQuestions={questions.length} />;
  }

  if (!questions || questions.length === 0 || !gameId) {
    return <Heading>Загрузка вопросов...</Heading>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const timeLeftText = Math.ceil((progress / 100) * timePerQuestion);

  return (
    <React.Fragment key={gameId}>
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ paddingTop: "10vh", minHeight: "80vh" }}
      >
        <Box style={{ width: "100%", maxWidth: "800px" }}>
          <Flex justify="between" align="center" mb="2">
            <Text size="2" color="gray">
              Осталось времени:
            </Text>
            <Text size="4" weight="bold">
              {timeLeftText}с
            </Text>
          </Flex>
          <Progress value={progress} size="3" mb="4" />

          <Text size="2" color="gray" align="center" mb="4">
            Вопрос {currentQuestionIndex + 1} из {questions.length}
          </Text>
          <Heading size="6" align="center" mb="5">
            {currentQuestion.questionText}
          </Heading>
          <Flex direction="column" gap="3">
            {currentQuestion.options.map((option, index) => {
              let buttonColor: "gray" | "green" | "red" = "gray";
              const style: React.CSSProperties = {};

              if (isRevealing) {
                style.pointerEvents = "none";
                if (index === currentQuestion.correctAnswerIndex) {
                  buttonColor = "green";
                } else if (index === selectedAnswerIndex) {
                  buttonColor = "red";
                } else {
                  style.opacity = 0.5;
                }
              }

              return (
                <Button
                  key={index}
                  size="3"
                  variant="soft"
                  color={buttonColor}
                  style={style}
                  onClick={() => handleAnswerClick(index)}
                >
                  {option}
                </Button>
              );
            })}
          </Flex>
        </Box>
      </Flex>
    </React.Fragment>
  );
}
