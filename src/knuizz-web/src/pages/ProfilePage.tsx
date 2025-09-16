// src/pages/ProfilePage.tsx
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../app/store";
import {
  useGetUserProfileQuery,
  useGetUserRankQuery,
  useGetUserStatisticsQuery,
  useUpdateUserProfileMutation,
  useGetMatchHistoryQuery,
} from "../features/api/apiSlice";
import {
  Flex,
  Text,
  Card,
  Spinner,
  Box,
  Callout,
  Progress,
  Heading,
  Table,
  Badge,
} from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import EditableUsername from "../components/ui/EditableUsername";
import toast, { Toaster } from "react-hot-toast";
import DonutChart from "../components/ui/DonutChart";
import crownImage from "../shared/assets/crown.png";

function experienceForNextLevel(currentLevel: number): number {
  const baseExperience = 50.0;
  const growthFactor = 1.2;
  return Math.floor(baseExperience * Math.pow(growthFactor, currentLevel - 1));
}

export default function ProfilePage() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const [updateUserProfile] = useUpdateUserProfileMutation();
  const { data: profile, isLoading: isLoadingProfile } =
    useGetUserProfileQuery();
  const userId = profile?.id;

  const { data: stats, isLoading: isLoadingStats } = useGetUserStatisticsQuery(
    userId!,
    { skip: !userId },
  );

  const { data: matchHistory = [], isLoading: isLoadingHistory } =
    useGetMatchHistoryQuery();

  const { data: playerRank, isLoading: isLoadingRank } = useGetUserRankQuery();

  if (isLoadingProfile || isLoadingStats || isLoadingRank || isLoadingHistory) {
    return (
      <Flex justify="center" align="center" className="min-h-[50vh]">
        <Spinner size="3" />
      </Flex>
    );
  }

  const handleUsernameSave = async (newUsername: string) => {
    const toastStyle = {
      background: "var(--gray-a3)",
      color: "var(--gray-12)",
      border: "1px solid var(--gray-a6)",
    };

    try {
      await updateUserProfile({ username: newUsername }).unwrap();
      toast.success("Имя пользователя успешно изменено!", {
        style: toastStyle,
      });
    } catch (err) {
      toast.error("Это имя уже занято. Попробуйте другое.", {
        style: toastStyle,
      });
      throw err;
    }
  };

  if (!profile || !stats) {
    return (
      <Flex justify="center" align="center" className="p-8">
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            Не удалось загрузить данные профиля. Пожалуйста, попробуйте обновить
            страницу.
          </Callout.Text>
        </Callout.Root>
      </Flex>
    );
  }

  const expToNextLevel = experienceForNextLevel(stats.level);
  const expPercentage = (stats.currentExperience / expToNextLevel) * 100;
  const accuracy =
    stats.totalAnswers > 0
      ? (stats.totalCorrectAnswers / stats.totalAnswers) * 100
      : 0;

  return (
    <Flex
      direction="column"
      gap="5"
      align="center"
      className="py-8 px-4 w-full inner-container"
    >
      <Flex direction="column" align="center" gap="2">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--gray-a3)",
              color: "var(--gray-12)",
              border: "1px solid var(--gray-a6)",
            },
          }}
        />

        <Flex direction="column" align="center" gap="1">
          <img
            src={crownImage}
            alt="Crown"
            style={{
              width: 30,
            }}
          />
          <EditableUsername
            initialUsername={profile.username}
            onSave={handleUsernameSave}
          />
          <Text size="3" color="gray">
            Уровень: {stats.level}
          </Text>
        </Flex>
      </Flex>

      <Flex direction="column" gap="2" className="w-full">
        {/* EXPERIENCE PROGRESS */}
        <Box className="w-full max-w-md">
          <Flex justify="between" mb="1">
            <Text size="2">Опыт</Text>
            <Text size="2" color="gray">
              {stats.currentExperience} / {expToNextLevel}
            </Text>
          </Flex>
          <Progress value={expPercentage} />
        </Box>

        {/* RATE AND PLACE */}
        <Flex justify="between" className="w-full max-w-md">
          <Box>
            <Text as="div" size="2" color="gray">
              Рейтинг
            </Text>
            <Text weight="bold">{stats.rating}</Text>
          </Box>
          <Box className="text-right">
            <Text as="div" size="2" color="gray">
              Место в топе
            </Text>
            <Text weight="bold">{playerRank ? playerRank : "N/A"}</Text>
          </Box>
        </Flex>
      </Flex>

      {/* PLAYER STATS */}
      <Flex className="w-full max-w-md" direction="row" gap="5">
        <Card className="w-full" style={{ flex: 1.5 }}>
          <Flex direction="column" gap="4" align="center" p="3">
            <Heading>Последние матчи</Heading>
            {matchHistory.length > 0 ? (
              <Table.Root variant="surface" size="1" className="w-full">
                <Table.Body>
                  {matchHistory.map((match, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>
                        <Badge
                          color={
                            match.sourceName.includes("trivia")
                              ? "blue"
                              : "purple"
                          }
                        >
                          {match.sourceName.replace("_", " ")}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell justify="center">
                        <Text weight="bold">{match.score} очков</Text>
                      </Table.Cell>
                      <Table.Cell justify="end">
                        <Text size="1" color="gray">
                          {new Date(match.completedAt).toLocaleDateString()}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            ) : (
              <Text color="gray" align="center" className="mt-4">
                У вас пока нет сыгранных матчей.
              </Text>
            )}
          </Flex>
        </Card>
        <Card className="w-full max-w-md" style={{ flex: 2 }}>
          <Heading align="center">Статистика</Heading>
          <Flex
            justify="between"
            gap="4"
            align="center"
            style={{
              padding: "2rem",
            }}
          >
            <Flex direction="column" gap="1">
              <Text size="5" color="gray">
                Сыграно игр: {stats.totalGamesPlayed}
              </Text>
              <Text size="5" color="gray">
                Правильных ответов: {stats.totalCorrectAnswers}
              </Text>
              <Text size="5" color="gray">
                Всего ответов: {stats.totalAnswers}
              </Text>
            </Flex>
            <Flex justify="center" direction="column" gap="2">
              <DonutChart accuracy={accuracy} size={200} />
              <Text align="center" size="2">
                Процент правильных ответов
              </Text>
            </Flex>
          </Flex>
        </Card>
      </Flex>
      {/* Ниже будет блок где будут представлены пользовательские викторины данного игрока */}
    </Flex>
  );
}
