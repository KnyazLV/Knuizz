import {
  Heading,
  Text,
  Button,
  Flex,
  Grid,
  Section,
  Link as RadixLink,
  Strong,
  Badge,
  Box,
} from "@radix-ui/themes";
import {
  RocketIcon,
  CodeIcon,
  BarChartIcon,
  GitHubLogoIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import AnimatedHeading from "../components/ui/AnimatedHeading.tsx";
import FloatingElement from "../components/ui/FloatingElement.tsx";
import AnimatedCounter from "../components/ui/AnimatedCounter.tsx";
import AnimatedWhenNotice from "../components/ui/AnimatedWhenNotice.tsx";
import { FloatingElementType } from "../shared/types/FloatingElementType.ts";
import GameModeSelector from "../components/feature/gameSetup/GameModeSelector.tsx";
import { useState } from "react";
import ReminderPopup from "../components/ui/ReminderPopup.tsx";
import { Trans, useTranslation } from "react-i18next";

const floatingElements = [
  {
    animationDelay: "2.5s",
    props: {
      type: FloatingElementType.QuestionMark,
      size: "8rem",
      top: "15%",
      left: "10%",
      rotation: -15,
      floatDuration: "10s",
    },
  },
  {
    animationDelay: "3.0s",
    props: {
      type: FloatingElementType.QuestionMark,
      size: "5rem",
      top: "65%",
      left: "20%",
      rotation: 20,
      floatDuration: "8s",
    },
  },
  {
    animationDelay: "3.5s",
    props: {
      type: FloatingElementType.QuestionMark,
      size: "10rem",
      top: "25%",
      right: "8%",
      rotation: 10,
      floatDuration: "12s",
    },
  },
  {
    animationDelay: "4.0s",
    props: {
      type: FloatingElementType.QuestionMark,
      size: "6rem",
      top: "70%",
      right: "18%",
      rotation: -25,
      floatDuration: "9s",
    },
  },
];

export default function HomePage() {
  const [showLobby, setShowLobby] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      {showLobby ? (
        <Section
          className="min-h-[calc(100vh_-_65px)]"
          style={{ paddingTop: 100 }}
        >
          <div className="animate__animated animate__zoomIn animate__faster w-full flex justify-center flex-col align-center">
            <div
              className="flex flex-col items-start m-auto"
              style={{
                width: "100%",
                maxWidth: 1400,
                padding: "0 10px",
              }}
            >
              <Button
                onClick={() => setShowLobby(false)}
                variant="ghost"
                color="gray"
                highContrast
                aria-label={t("homePage.back")}
                m="2"
              >
                <ArrowLeftIcon width="18" height="18" />
                {t("homePage.back")}
              </Button>
              <GameModeSelector />
            </div>
          </div>
        </Section>
      ) : (
        <Section className="relative min-h-[calc(100vh_-_65px)] flex flex-col items-center justify-center text-center px-2">
          {floatingElements.map((item, idx) => (
            <div
              key={idx}
              className="animate__animated animate__fadeIn"
              style={{ animationDelay: item.animationDelay }}
            >
              <FloatingElement {...item.props} />
            </div>
          ))}

          <Text
            as="span"
            className="uppercase animate__animated animate__fadeInDown"
          >
            {t("homePage.gameTitle")}
          </Text>

          <AnimatedHeading
            text={t("homePage.mainHeading")}
            size="9"
            align="center"
            mt="3"
            mb="4"
          />

          <Text
            as="p"
            size="5"
            align="center"
            color="gray"
            mb="4"
            style={{ maxWidth: "600px", padding: "0 10px" }}
            className="animate__animated animate__fadeInUp animate__delay-1s"
          >
            {t("homePage.description")}
          </Text>

          <div className="animate__animated animate__fadeIn animate__delay-2s">
            <Button size="4" highContrast onClick={() => setShowLobby(true)}>
              {t("homePage.startGame")}
            </Button>
          </div>
        </Section>
      )}

      <div className="shape-divider">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M1200 0L0 0 598.97 114.72 1200 0z"
            className="shape-fill"
          ></path>
        </svg>
      </div>
      <Section className="relative py-24 sm:py-32 bg-[var(--slate-2)]">
        <div className="inner-container relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <Flex direction="column" gap="2">
            <AnimatedWhenNotice>
              <Flex
                direction="column"
                gap="2"
                className="animate__animated animate__slideInUp text-center"
              >
                <Badge color="purple" className="self-center">
                  {t("homePage.aboutProjectBadge")}
                </Badge>
                <Heading size="8" className="text-gradient">
                  {t("homePage.aboutProjectTitle")}
                </Heading>

                <Text as="p" size="5" color="gray">
                  <Trans i18nKey="homePage.aboutProjectDescription1">
                    <Strong className="text-[var(--accent-11)]">Knuizz</Strong>
                  </Trans>
                </Text>
                <Text as="p" size="5" color="gray">
                  <Trans i18nKey="homePage.aboutProjectDescription2">
                    <a href="mailto:r.belovs@inbox.lv">r.belovs@inbox.lv</a>
                  </Trans>
                </Text>
                <Button variant="soft" size="3" asChild className="self-center">
                  <RadixLink
                    href="https://github.com/KnyazLV/Knuizz"
                    target="_blank"
                  >
                    <GitHubLogoIcon />
                    {t("homePage.sourceCode")}
                  </RadixLink>
                </Button>
              </Flex>
            </AnimatedWhenNotice>

            <Grid
              columns={{ initial: "1", sm: "2", lg: "3" }}
              gap="8"
              className="mt-16"
            >
              <AnimatedWhenNotice animationName="fadeInLeft">
                <Box p="4">
                  <Flex
                    p="4"
                    direction="column"
                    gap="2"
                    className="items-center mb-6 animate__animated animate__fadeInLeft"
                  >
                    <RocketIcon
                      width="24"
                      height="24"
                      className="text-[var(--accent-11)]"
                    />
                    <Heading size="4" className="text-[var(--slate-12)]">
                      {t("homePage.featureQuickRoundsTitle")}
                    </Heading>
                  </Flex>
                  <Text as="p" className="text-center" size="3" color="gray">
                    {t("homePage.featureQuickRoundsDescription")}
                  </Text>
                </Box>
              </AnimatedWhenNotice>
              <AnimatedWhenNotice>
                <Box p="4">
                  <Flex
                    p="4"
                    direction="column"
                    gap="2"
                    className="items-center mb-6"
                  >
                    <CodeIcon
                      width="24"
                      height="24"
                      className="text-[var(--accent-11)]"
                    />
                    <Heading size="4" className="text-[var(--slate-12)]">
                      {t("homePage.featureApiTitle")}
                    </Heading>
                  </Flex>
                  <Text as="p" className="text-center" size="3" color="gray">
                    {t("homePage.featureApiDescription")}
                  </Text>
                </Box>
              </AnimatedWhenNotice>
              <AnimatedWhenNotice animationName="fadeInRight">
                <Box p="4">
                  <Flex
                    p="4"
                    direction="column"
                    gap="2"
                    className="items-center mb-6"
                  >
                    <BarChartIcon
                      width="24"
                      height="24"
                      className="text-[var(--accent-11)]"
                    />
                    <Heading size="4" className="text-[var(--slate-12)]">
                      {t("homePage.featureRatingTitle")}
                    </Heading>
                  </Flex>
                  <Text as="p" className="text-center" size="3" color="gray">
                    {t("homePage.featureRatingDescription")}
                  </Text>
                </Box>
              </AnimatedWhenNotice>
            </Grid>
            <Box pt="3" className="text-center">
              <AnimatedCounter endValue={10000} duration={2500} />
              <Text size="5" color="gray" weight="medium">
                {t("homePage.questionsInDb")}
              </Text>
            </Box>
          </Flex>
        </div>
      </Section>
      <ReminderPopup />
    </>
  );
}
