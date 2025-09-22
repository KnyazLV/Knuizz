import { useEffect, useState } from "react";
import {
  useGetUserProfileQuery,
  useLazyGetQuestionsFromSourceQuery,
  useLazyGetQuizByIdQuery,
} from "../../../features/api/apiSlice.ts";
import {
  Flex,
  Box,
  Text,
  Button,
  Heading,
  RadioCards,
  Card,
  Separator,
  Badge,
  Link,
} from "@radix-ui/themes";
import {
  LaptopIcon,
  GlobeIcon,
  PersonIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import UserQuizzesView from "./UserQuizzesView.tsx";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { startGame } from "../../../features/game/gameSlice.ts";
import type { RootState } from "../../../app/store.ts";

const ANIMATION_DURATION = 150;

const predefinedSources = [
  {
    value: "trivia_api",
    label: "Викторина Trivia API",
    lang: "EN",
    icon: GlobeIcon,
    description:
      "Набор случайных вопросов на английском языке на самые разные темы из открытого источника Trivia API. Отличный выбор для быстрой разминки и проверки эрудиции.",
    sourceLink: "https://opentdb.com/",
  },
  {
    value: "wwtbm_ru",
    label: "Кто хочет стать миллионером",
    lang: "RU",
    icon: LaptopIcon,
    description:
      "Классические вопросы на русском языке из базы, вдохновленной знаменитым телешоу. Сборник содержит вопросы передачи на момент декабря 2003г. Автор: Сергей Зубарь.",
    sourceLink: "https://sevabashirov.livejournal.com/398325.html",
  },
  {
    value: "wwtbm_en",
    label: "Кто хочет стать миллионером",
    lang: "EN",
    icon: LaptopIcon,
    description:
      'База данных собранная анонимным пользователем с Reddit, основанная на вопросах из GameFAQs в формате известной телепередачи "Кто хочет стать миллионером"',
    sourceLink: "https://pastebin.com/QRGzxxEy",
  },
  {
    value: "my_quizzes",
    label: "Мои викторины",
    lang: "RU/EN",
    icon: PersonIcon,
    description: null,
    sourceLink: null,
  },
  {
    value: "search_quizzes",
    label: "Поиск викторин",
    lang: "RU/EN",
    icon: MagnifyingGlassIcon,
    description: null,
    sourceLink: null,
  },
];

export default function GameModeSelector() {
  const [activeMode, setActiveMode] = useState("trivia_api");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useGetUserProfileQuery();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [triggerGetQuestions, { isLoading: isLoadingSource }] =
    useLazyGetQuestionsFromSourceQuery();
  const [triggerGetQuiz, { isLoading: isLoadingCustom }] =
    useLazyGetQuizByIdQuery();

  useEffect(() => {
    if (!isAuthenticated) {
      if (activeMode === "my_quizzes" || activeMode === "search_quizzes") {
        setActiveMode("trivia_api");
      }
      setSelectedQuizId(null);
    }
  }, [isAuthenticated, activeMode]);

  const handleModeChange = (value: string) => {
    setIsContentVisible(false);
    setTimeout(() => {
      setActiveMode(value);
      setSelectedQuizId(null);
      setIsContentVisible(true);
    }, ANIMATION_DURATION);
  };

  const selectedSource = predefinedSources.find((s) => s.value === activeMode);

  const isCustomQuizMode =
    activeMode === "my_quizzes" || activeMode === "search_quizzes";

  const isLoading = isLoadingSource || isLoadingCustom;
  const isStartDisabled = (isCustomQuizMode && !selectedQuizId) || isLoading;

  const handleStartGame = async () => {
    try {
      let questions;
      const sourceName = activeMode;
      let userQuizId: string | null = null;

      if (isCustomQuizMode && selectedQuizId) {
        const quizDetails = await triggerGetQuiz(selectedQuizId).unwrap();
        questions = quizDetails.questions;
        userQuizId = selectedQuizId;
      } else if (selectedSource) {
        const sourceQuestions = await triggerGetQuestions({
          source: selectedSource.value,
          count: 5,
        }).unwrap();
        questions = sourceQuestions;
      }

      if (questions && questions.length > 0) {
        dispatch(startGame({ questions, sourceName, userQuizId }));
        navigate("/game");
      } else {
        toast.error(
          "Не удалось загрузить вопросы. Попробуйте другой источник.",
        );
      }
    } catch (error) {
      toast.error("Произошла ошибка при запуске игры.");
      console.error("Ошибка при старте игры:", error);
    }
  };

  return (
    <Card
      className="game-mode-selector"
      style={{
        width: "100%",
        // height: 550,
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Heading size="7" align="center" m="2">
        Настройте вашу викторину
      </Heading>
      <Separator size="4" my="4" />

      <Flex
        gap="5"
        style={{
          display: "flex",
          minWidth: "0",
          height: "100%",
        }}
      >
        {/* Left */}
        <Box
          style={{
            flexGrow: 0.5,
            flexBasis: 0,
            minWidth: 0,
            height: "100%",
          }}
        >
          <Heading align="center" m="2" size="4">
            Источники
          </Heading>
          <RadioCards.Root value={activeMode} onValueChange={handleModeChange}>
            <Flex direction="column" gap="3" style={{ height: 400 }}>
              {predefinedSources.map((source) => {
                const disabled =
                  (source.value === "my_quizzes" ||
                    source.value === "search_quizzes") &&
                  !profile;

                return (
                  <RadioCards.Item
                    key={source.value}
                    value={source.value}
                    disabled={disabled}
                    style={{ height: "100%" }}
                  >
                    <Flex justify="between" align="center" width="100%">
                      <Flex gap="3" align="center">
                        <source.icon width="20" height="20" />
                        <Text weight="bold">{source.label}</Text>
                      </Flex>
                      <Badge color="gray" radius="full">
                        {source.lang}
                      </Badge>
                    </Flex>
                  </RadioCards.Item>
                );
              })}
            </Flex>
          </RadioCards.Root>
        </Box>

        {/* Right */}
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            flexBasis: 0,
            minWidth: 0,
            transition: `opacity ${ANIMATION_DURATION}ms ease-out`,
            opacity: isContentVisible ? 1 : 0,
          }}
        >
          <Heading align="center" m="2" size="4">
            Описание
          </Heading>
          <Flex direction="column" gap="2" style={{ height: "100%" }}>
            <Box>
              {selectedSource && selectedSource.description && (
                <Card variant="surface">
                  <Heading mb="3">{selectedSource.label}</Heading>
                  <Text color="gray" as="p">
                    {selectedSource.description}
                  </Text>
                  {selectedSource.sourceLink && (
                    <Text as="p" mt="4" size="2">
                      Источник:{" "}
                      <Link href={selectedSource.sourceLink} target="_blank">
                        {selectedSource.sourceLink}
                      </Link>
                    </Text>
                  )}
                </Card>
              )}

              {activeMode === "my_quizzes" && profile && (
                <UserQuizzesView
                  mode="my"
                  userId={profile.id}
                  onSelectQuiz={setSelectedQuizId}
                  selectedQuizId={selectedQuizId}
                />
              )}

              {activeMode === "search_quizzes" && profile && (
                <UserQuizzesView
                  mode="search"
                  userId={profile.id}
                  onSelectQuiz={setSelectedQuizId}
                  selectedQuizId={selectedQuizId}
                />
              )}

              {isCustomQuizMode && !profile && (
                <Text color="gray">
                  Пожалуйста, войдите в систему, чтобы использовать этот режим.
                </Text>
              )}
            </Box>

            <Flex justify="center" mt="4" style={{ marginTop: "auto" }}>
              <Button
                size="3"
                disabled={isStartDisabled}
                onClick={handleStartGame}
              >
                Начать
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
}
