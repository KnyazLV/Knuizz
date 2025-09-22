// src/pages/GamePage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { answerQuestion, resetGame } from "../features/game/gameSlice";
import { Box, Heading, Button, Flex, Text, Progress } from "@radix-ui/themes";
import GameSummary from "../components/feature/game/GameSummary.tsx";
import { useSound } from "../hooks/useSound.tsx";

const PRE_TIMER_DELAY = 5000;
const ANIMATION_DURATION = 200;
const TIMEOUT_SOUND_DURATION_MS = 3000;

export default function GamePage() {
  const { playSound, stopSound } = useSound();
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
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const timeoutSoundPlayedRef = useRef(false);
  const questionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setGameStartTime(Date.now());
  }, []);

  useEffect(() => {
    timeoutSoundPlayedRef.current = false;
    setIsRevealing(false);
    setProgress(100);
    setIsTransitioning(false);

    const preTimer = setTimeout(() => {
      setIsTimerActive(true);
    }, PRE_TIMER_DELAY);

    return () => clearTimeout(preTimer);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (!isTimerActive || isRevealing) {
      return;
    }

    const startTime = Date.now();
    questionIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeLeftMs = timePerQuestion * 1000 - elapsed;
      const newProgress = 100 - (elapsed / (timePerQuestion * 1000)) * 100;

      if (
        timeLeftMs <= TIMEOUT_SOUND_DURATION_MS &&
        !timeoutSoundPlayedRef.current
      ) {
        playSound("timeout");
        timeoutSoundPlayedRef.current = true;
      }

      if (timeLeftMs <= 0) {
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
  }, [isTimerActive, isRevealing, timePerQuestion, playSound]);

  useEffect(() => {
    if (!isRevealing) return;

    const revealTimer = setTimeout(() => {
      setIsTransitioning(true);
      const transitionTimer = setTimeout(() => {
        dispatch(answerQuestion({ answerIndex: selectedAnswerIndex ?? -1 }));
      }, ANIMATION_DURATION);
      return () => clearTimeout(transitionTimer);
    }, 1500);

    return () => clearTimeout(revealTimer);
  }, [isRevealing, selectedAnswerIndex, dispatch]);

  useEffect(() => {
    return () => {
      stopSound("endgame");
      dispatch(resetGame());
    };
  }, [dispatch, stopSound]);

  useEffect(() => {
    if (gameStatus === "finished") {
      playSound("endgame", { volume: 0.3, loop: true });
    }
  }, [gameStatus, playSound]);

  const handleAnswerClick = (index: number) => {
    if (isRevealing) return;

    if (questionIntervalRef.current) clearInterval(questionIntervalRef.current);
    setIsTimerActive(false);

    const currentQuestion = questions[currentQuestionIndex];
    if (index === currentQuestion.correctAnswerIndex) {
      playSound("correct");
    } else {
      playSound("wrong");
    }

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
        style={{ padding: "5vh 0", minHeight: "90vh" }}
      >
        <Box
          key={currentQuestionIndex}
          className={`animate__animated ${isTransitioning ? "animate__fadeOut" : "animate__fadeIn"}`}
          style={{ width: "100%", maxWidth: "1200px" }}
        >
          <Flex justify="between" align="center" mb="2">
            <Text size="5" color="gray">
              Осталось времени:
            </Text>
            <Text size="8" weight="bold">
              {timeLeftText}с
            </Text>
          </Flex>
          <Progress value={progress} size="3" mb="4" />

          <Text size="4" color="gray" align="center" mb="6">
            Вопрос {currentQuestionIndex + 1} из {questions.length}
          </Text>
          <Heading size="8" align="center" mb="6">
            {currentQuestion.questionText}
          </Heading>
          <Flex direction="column" gap="4">
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
                  size="4"
                  variant="soft"
                  color={buttonColor}
                  style={{ ...style, padding: "28px" }}
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
