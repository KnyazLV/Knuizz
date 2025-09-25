// src/components/ui/UserStatsHoverCard.tsx
import { HoverCard, Flex, Text, Box, Spinner } from "@radix-ui/themes";
import React from "react";
import { useTranslation } from "react-i18next";
import { useGetUserStatisticsQuery } from "@/features/api/apiSlice.ts";

interface UserStatsHoverCardProps {
  userId: string;
  username: string;
  children: React.ReactNode;
}

export default function UserStatsHoverCard({
  userId,
  username,
  children,
}: UserStatsHoverCardProps) {
  const { t } = useTranslation();
  const { data: stats, isLoading, isError } = useGetUserStatisticsQuery(userId);

  return (
    <HoverCard.Root>
      <HoverCard.Trigger>
        <div style={{ display: "inline-block" }} className="cursor-pointer">
          {children}
        </div>
      </HoverCard.Trigger>
      <HoverCard.Content size="1" style={{ width: 260 }}>
        <Box p="2">
          {isLoading && (
            <Flex justify="center" align="center" style={{ height: 120 }}>
              <Spinner />
            </Flex>
          )}
          {isError && (
            <Flex justify="center" align="center" style={{ height: 120 }}>
              <Text color="red" size="2">
                {t("userStatsHoverCard.errorLoading")}
              </Text>
            </Flex>
          )}
          {stats && (
            <Flex direction="column" gap="2">
              <Text size="3" weight="bold">
                {username}
              </Text>
              <Flex justify="between">
                <Text size="2" color="gray">
                  {t("userStatsHoverCard.ratingLabel")}
                </Text>
                <Text size="2" weight="medium">
                  {stats.rating}
                </Text>
              </Flex>
              <Flex justify="between">
                <Text size="2" color="gray">
                  {t("userStatsHoverCard.levelLabel")}
                </Text>
                <Text size="2" weight="medium">
                  {stats.level}
                </Text>
              </Flex>
              <Flex justify="between">
                <Text size="2" color="gray">
                  {t("userStatsHoverCard.totalGamesLabel")}
                </Text>
                <Text size="2" weight="medium">
                  {stats.totalGamesPlayed}
                </Text>
              </Flex>
              <Flex justify="between">
                <Text size="2" color="gray">
                  {t("userStatsHoverCard.accuracyLabel")}
                </Text>
                <Text size="2" weight="medium">
                  {stats.totalAnswers > 0
                    ? `${Math.round((stats.totalCorrectAnswers / stats.totalAnswers) * 100)}%`
                    : t("userStatsHoverCard.notAvailable")}
                </Text>
              </Flex>
            </Flex>
          )}
        </Box>
      </HoverCard.Content>
    </HoverCard.Root>
  );
}
