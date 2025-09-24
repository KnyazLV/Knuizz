import { useEffect, useState } from "react";
import {
  useGetUserProfileQuery,
  useLazyGetQuestionsFromSourceQuery,
  useLazyGetQuizByIdQuery,
} from "../../../features/api/apiSlice.ts";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Link,
  RadioCards,
  Separator,
  Text,
} from "@radix-ui/themes";
import {
  GlobeIcon,
  LaptopIcon,
  MagnifyingGlassIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import UserQuizzesView from "./UserQuizzesView.tsx";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { startGame } from "../../../features/game/gameSlice.ts";
import type { RootState } from "../../../app/store.ts";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";

const ANIMATION_DURATION = 150;

const sourcesConfig = [
  {
    value: "trivia_api",
    lang: "EN",
    icon: GlobeIcon,
    sourceLink: "https://opentdb.com/",
  },
  {
    value: "wwtbm_ru",
    lang: "RU",
    icon: LaptopIcon,
    sourceLink: "https://sevabashirov.livejournal.com/398325.html",
  },
  {
    value: "wwtbm_en",
    lang: "EN",
    icon: LaptopIcon,
    sourceLink: "https://pastebin.com/QRGzxxEy",
  },
  { value: "my_quizzes", lang: "RU/EN", icon: PersonIcon, sourceLink: null },
  {
    value: "search_quizzes",
    lang: "RU/EN",
    icon: MagnifyingGlassIcon,
    sourceLink: null,
  },
];

export default function GameModeSelector() {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState("trivia_api");
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [isContentVisible, setIsContentVisible] = useState(true);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: profile } = useGetUserProfileQuery();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [triggerGetQuestions, { isLoading: isLoadingSource }] =
    useLazyGetQuestionsFromSourceQuery();
  const [triggerGetQuiz, { isLoading: isLoadingCustom }] =
    useLazyGetQuizByIdQuery();

  const predefinedSources = sourcesConfig.map((source) => ({
    ...source,
    label: t(`gameModeSelector.sources.${source.value}.label`),
    description: t(`gameModeSelector.sources.${source.value}.description`),
  }));

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
        questions = await triggerGetQuestions({
          source: selectedSource.value,
          count: 5,
        }).unwrap();
      }

      if (questions && questions.length > 0) {
        dispatch(startGame({ questions, sourceName, userQuizId }));
        navigate("/game");
      } else {
        toast.error(t("gameModeSelector.errorLoadQuestions"));
      }
    } catch (error) {
      toast.error(t("gameModeSelector.errorStartGame"));
      console.error("Error when starting the game:", error);
    }
  };

  return (
    <Card
      className="game-mode-selector"
      style={{
        width: "100%",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Heading size="7" align="center" m="2">
        {t("gameModeSelector.title")}
      </Heading>
      <Separator size="4" my="4" />

      <Flex
        gap="5"
        style={{
          display: "flex",
          minWidth: "0",
          height: "100%",
          flexDirection: isMobile ? "column" : "row",
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
            {t("gameModeSelector.sourcesHeading")}
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
            {t("gameModeSelector.descriptionHeading")}
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
                      {t("gameModeSelector.sourceLabel")}:{" "}
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
                  {t("gameModeSelector.loginRequiredMessage")}
                </Text>
              )}
            </Box>

            <Flex justify="center" mt="4" style={{ marginTop: "auto" }}>
              <Button
                size="3"
                disabled={isStartDisabled}
                onClick={handleStartGame}
              >
                {t("gameModeSelector.startButton")}
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
    </Card>
  );
}
