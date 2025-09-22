// src/components/features/game-play/GameSummary.tsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../app/store";
import { useSubmitMatchResultMutation } from "../../../features/api/apiSlice";
import {
  Box,
  Heading,
  Button,
  Flex,
  Text,
  Card,
  Spinner,
  Separator,
  Badge,
} from "@radix-ui/themes";
import { StarFilledIcon, RocketIcon } from "@radix-ui/react-icons";
import DonutChart from "../../ui/DonutChart";

const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds < 60) {
    return `${totalSeconds} сек.`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes} мин. ${seconds.toString().padStart(2, "0")} сек.`;
};

const RANKED_SOURCES = ["trivia_api", "wwtbm_ru", "wwtbm_en"];

interface GameSummaryProps {
  score: number;
  totalQuestions: number;
  durationSeconds: number;
}

export default function GameSummary({
  score,
  totalQuestions,
  durationSeconds,
}: GameSummaryProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { sourceName, userQuizId } = useSelector(
    (state: RootState) => state.game,
  );

  const [submitResult, { data: matchResult, isLoading, isSuccess, isError }] =
    useSubmitMatchResultMutation();

  useEffect(() => {
    if (isAuthenticated && sourceName) {
      submitResult({
        sourceName,
        userQuizId,
        score,
        totalQuestions,
        durationSeconds,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, sourceName, userQuizId]);

  const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  const isRankedGame = sourceName ? RANKED_SOURCES.includes(sourceName) : false;

  return (
    <Flex align="center" justify="center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: "100%", maxWidth: "600px" }}>
        <Box p="4">
          <Heading size="7" align="center" mb="4">
            Игра окончена!
          </Heading>

          <Separator size="4" my="4" />

          <Flex direction="column" align="center" gap="4">
            <DonutChart accuracy={accuracy} size={120} />
            <Flex direction="column" gap="2" style={{ width: "100%" }}>
              <Flex justify="between">
                <Text color="gray">Правильные ответы:</Text>
                <Text weight="bold">
                  {score} из {totalQuestions}
                </Text>
              </Flex>
              <Flex justify="between">
                <Text color="gray">Затраченное время:</Text>
                <Text weight="bold">{formatDuration(durationSeconds)}</Text>
              </Flex>
            </Flex>
          </Flex>

          <Separator size="4" my="5" />

          {isAuthenticated ? (
            <Box>
              {isLoading && (
                <Flex
                  align="center"
                  justify="center"
                  direction="column"
                  gap="2"
                  my="4"
                >
                  <Spinner size="3" />
                  <Text color="gray">Сохраняем результаты...</Text>
                </Flex>
              )}
              {isSuccess && matchResult && (
                <>
                  {isRankedGame ? (
                    <Flex direction="column" gap="3" my="4">
                      <Flex justify="between" align="center">
                        <Flex align="center" gap="2">
                          <StarFilledIcon color="var(--yellow-9)" />
                          <Text>Получено опыта:</Text>
                        </Flex>
                        <Badge color="yellow" size="2">
                          +{matchResult.xpGained} XP
                        </Badge>
                      </Flex>
                      <Flex justify="between" align="center">
                        <Flex align="center" gap="2">
                          <RocketIcon color="var(--ruby-9)" />
                          <Text>Изменение рейтинга:</Text>
                        </Flex>
                        <Badge
                          color={
                            matchResult.newRating >= matchResult.oldRating
                              ? "green"
                              : "red"
                          }
                          size="2"
                        >
                          {matchResult.newRating - matchResult.oldRating >= 0
                            ? "+"
                            : ""}
                          {matchResult.newRating - matchResult.oldRating}
                        </Badge>
                      </Flex>
                    </Flex>
                  ) : (
                    <Text as="p" size="2" color="gray" align="center" my="4">
                      Опыт и рейтинг за прохождение пользовательских викторин не
                      начисляется.
                    </Text>
                  )}
                </>
              )}
              {isError && (
                <Text color="red" align="center">
                  Не удалось сохранить результаты.
                </Text>
              )}
            </Box>
          ) : (
            <Text as="p" color="gray" align="center" my="5">
              <a
                onClick={() => navigate("/auth")}
                style={{ cursor: "pointer", textDecoration: "underline" }}
              >
                Войдите или зарегистрируйтесь
              </a>
              , чтобы сохранять прогресс и соревноваться в рейтинге!
            </Text>
          )}

          <Flex justify="center" mt="5">
            <Button size="3" onClick={() => navigate("/")}>
              Вернуться на главную
            </Button>
          </Flex>
        </Box>
      </Card>
    </Flex>
  );
}
