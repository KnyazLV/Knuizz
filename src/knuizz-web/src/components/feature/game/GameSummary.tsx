// src/components/features/game/GameSummary.tsx
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

  // 1. Инициализируем мутацию для отправки данных
  const [submitResult, { data: matchResult, isLoading, isSuccess, isError }] =
    useSubmitMatchResultMutation();

  // 2. Этот useEffect отправит данные на сервер, как только компонент появится на экране (если пользователь авторизован)
  useEffect(() => {
    if (isAuthenticated) {
      submitResult({ score, totalQuestions, duration: durationSeconds });
    }
    // Мы хотим, чтобы этот эффект сработал только один раз
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, submitResult]);

  const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  return (
    <Flex align="center" justify="center" style={{ minHeight: "80vh" }}>
      <Card style={{ width: "100%", maxWidth: "600px" }}>
        <Box p="4">
          <Heading size="7" align="center" mb="4">
            Игра окончена!
          </Heading>

          <Separator size="4" my="4" />

          {/* Блок с основной статистикой */}
          <Flex direction="column" gap="3">
            <Flex justify="between">
              <Text color="gray">Правильные ответы:</Text>
              <Text weight="bold">
                {score} из {totalQuestions}
              </Text>
            </Flex>
            <Flex justify="between">
              <Text color="gray">Точность:</Text>
              <Text weight="bold">{accuracy.toFixed(1)}%</Text>
            </Flex>
            <Flex justify="between">
              <Text color="gray">Затраченное время:</Text>
              <Text weight="bold">{durationSeconds} сек.</Text>
            </Flex>
          </Flex>

          <Separator size="4" my="5" />

          {/* 3. Блок с результатами для авторизованного пользователя */}
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
                <Flex direction="column" gap="3" my="4">
                  <Flex justify="between" align="center">
                    <Flex align="center" gap="2">
                      <StarFilledIcon color="var(--yellow-9)" />{" "}
                      <Text>Получено опыта:</Text>
                    </Flex>
                    <Badge color="yellow" size="2">
                      +{matchResult.xpGained} XP
                    </Badge>
                  </Flex>
                  <Flex justify="between" align="center">
                    <Flex align="center" gap="2">
                      <RocketIcon color="var(--ruby-9)" />{" "}
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
                      {matchResult.newRating - matchResult.oldRating > 0
                        ? "+"
                        : ""}
                      {matchResult.newRating - matchResult.oldRating}
                    </Badge>
                  </Flex>
                </Flex>
              )}
              {isError && (
                <Text color="red" align="center">
                  Не удалось сохранить результаты.
                </Text>
              )}
            </Box>
          ) : (
            // 4. Сообщение для неавторизованного пользователя
            <Text as="p" color="gray" align="center" my="5">
              <a onClick={() => navigate("/auth")}>
                Войдите или зарегистрируйтесь
              </a>
              , чтобы сохранять прогресс, получать опыт и соревноваться в
              рейтинге!
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
