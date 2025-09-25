import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "@/app/store.ts";
import { useSubmitMatchResultMutation } from "@/features/api/apiSlice.ts";
import { useTranslation, Trans } from "react-i18next";
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
import LevelUpModal from "../../ui/LevelUpModal.tsx";

const formatDuration = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    minutes,
    seconds: seconds.toString().padStart(2, "0"),
    totalSeconds,
  };
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { sourceName, userQuizId } = useSelector(
    (state: RootState) => state.game,
  );
  const [submitResult, { data: matchResult, isLoading, isSuccess, isError }] =
    useSubmitMatchResultMutation();
  const [levelUpInfo, setLevelUpInfo] = useState<{
    oldLevel: number;
    newLevel: number;
  } | null>(null);

  const duration = formatDuration(durationSeconds);
  const durationText =
    duration.minutes > 0
      ? t("game.summary.duration.minutesSeconds", {
          minutes: duration.minutes,
          seconds: duration.seconds,
        })
      : t("game.summary.duration.seconds", { count: duration.totalSeconds });

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

  useEffect(() => {
    if (isSuccess && matchResult) {
      if (matchResult.newLevel > matchResult.oldLevel) {
        setLevelUpInfo({
          oldLevel: matchResult.oldLevel,
          newLevel: matchResult.newLevel,
        });
      }
    }
  }, [isSuccess, matchResult]);

  const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  const isRankedGame = sourceName ? RANKED_SOURCES.includes(sourceName) : false;

  return (
    <>
      <Flex
        align="center"
        justify="center"
        className="animate__animated animate__fadeInUp"
        style={{ minHeight: "80vh", padding: "0 10px" }}
      >
        <Card style={{ width: "100%", maxWidth: "600px" }}>
          <Box p="4">
            <Heading size="7" align="center" mb="4">
              {t("game.summary.gameOverTitle")}
            </Heading>

            <Separator size="4" my="4" />

            <Flex direction="column" align="center" gap="4">
              <DonutChart accuracy={accuracy} size={120} />
              <Flex direction="column" gap="2" style={{ width: "100%" }}>
                <Flex justify="between">
                  <Text color="gray">
                    {t("game.summary.correctAnswersLabel")}
                  </Text>
                  <Text weight="bold">
                    {t("game.summary.correctAnswersValue", {
                      score,
                      total: totalQuestions,
                    })}
                  </Text>
                </Flex>
                <Flex justify="between">
                  <Text color="gray">{t("game.summary.timeSpentLabel")}</Text>
                  <Text weight="bold">{durationText}</Text>
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
                    <Text color="gray">{t("game.summary.savingResults")}</Text>
                  </Flex>
                )}
                {isSuccess && matchResult && (
                  <>
                    {isRankedGame ? (
                      <Flex direction="column" gap="3" my="4">
                        <Flex justify="between" align="center">
                          <Flex align="center" gap="2">
                            <StarFilledIcon color="var(--yellow-9)" />
                            <Text>{t("game.summary.xpGainedLabel")}</Text>
                          </Flex>
                          <Badge color="yellow" size="2">
                            +{matchResult.xpGained} XP
                          </Badge>
                        </Flex>
                        <Flex justify="between" align="center">
                          <Flex align="center" gap="2">
                            <RocketIcon color="var(--ruby-9)" />
                            <Text>{t("game.summary.ratingChangeLabel")}</Text>
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
                        {t("game.summary.noXpForCustom")}
                      </Text>
                    )}
                  </>
                )}
                {isError && (
                  <Text color="red" align="center">
                    {t("game.summary.errorSaving")}
                  </Text>
                )}
              </Box>
            ) : (
              <Text as="p" color="gray" align="center" my="5">
                <Trans i18nKey="game.summary.loginPrompt">
                  <a
                    onClick={() => navigate("/auth")}
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  />
                </Trans>
              </Text>
            )}

            <Flex justify="center" mt="5">
              <Button size="3" onClick={() => navigate("/")}>
                {t("game.summary.backToHomeBtn")}
              </Button>
            </Flex>
          </Box>
        </Card>
      </Flex>

      {levelUpInfo && (
        <LevelUpModal
          isOpen={levelUpInfo !== null}
          oldLevel={levelUpInfo.oldLevel}
          newLevel={levelUpInfo.newLevel}
          onClose={() => setLevelUpInfo(null)}
        />
      )}
    </>
  );
}
