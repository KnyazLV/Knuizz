// src/pages/HomePage.tsx
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
import GameModeSelector from "../components/ui/GameModeSelector.tsx";
import { useState } from "react";

export default function HomePage() {
  const [showLobby, setShowLobby] = useState(false);
  return (
    <>
      {showLobby ? (
        <Section
          className="min-h-[calc(100vh_-_65px)]"
          style={{ paddingTop: 100 }}
        >
          <div className="animate__animated animate__fadeIn w-full flex justify-center flex-col align-center">
            <div
              className="flex flex-col items-start m-auto"
              style={{ width: "100%", maxWidth: 1400 }}
            >
              <Button
                onClick={() => setShowLobby(false)}
                variant="ghost"
                color="gray"
                highContrast
                aria-label="Назад"
                m="2"
              >
                <ArrowLeftIcon width="18" height="18" />
                Назад
              </Button>
              <GameModeSelector />
            </div>
          </div>
        </Section>
      ) : (
        <Section className="relative min-h-[calc(100vh_-_65px)] flex flex-col items-center justify-center text-center px-2">
          <div
            className="animate__animated animate__fadeIn"
            style={{ animationDelay: "2.5s" }}
          >
            <FloatingElement
              type={FloatingElementType.QuestionMark}
              size="8rem"
              top="15%"
              left="10%"
              rotation={-15}
              floatDuration="10s"
            />
          </div>
          <div
            className="animate__animated animate__fadeIn"
            style={{ animationDelay: "3.0s" }}
          >
            <FloatingElement
              type={FloatingElementType.QuestionMark}
              size="5rem"
              top="65%"
              left="20%"
              rotation={20}
              floatDuration="8s"
            />
          </div>
          <div
            className="animate__animated animate__fadeIn"
            style={{ animationDelay: "3.5s" }}
          >
            <FloatingElement
              type={FloatingElementType.QuestionMark}
              size="10rem"
              top="25%"
              right="8%"
              rotation={10}
              floatDuration="12s"
            />
          </div>
          <div
            className="animate__animated animate__fadeIn"
            style={{ animationDelay: "4.0s" }}
          >
            <FloatingElement
              type={FloatingElementType.QuestionMark}
              size="6rem"
              top="70%"
              right="18%"
              rotation={-25}
              floatDuration="9s"
            />
          </div>

          <Text
            as="span"
            className="uppercase animate__animated animate__fadeInDown"
          >
            Викторина
          </Text>

          <AnimatedHeading
            text="Испытай свою эрудицию"
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
            style={{ maxWidth: "600px" }}
            className="animate__animated animate__fadeInUp animate__delay-1s"
          >
            Проверь свои знания в самых разных категориях — от науки до
            поп-культуры и состязайся с другими знатоками за титул Князя знаний!
          </Text>

          {/* 6. Кнопка теперь управляет состоянием showLobby */}
          <div className="animate__animated animate__fadeIn animate__delay-2s">
            <Button size="4" highContrast onClick={() => setShowLobby(true)}>
              Начать игру
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
                  Pet-проект с открытым исходным кодом
                </Badge>
                <Heading size="8" className="text-gradient">
                  О проекте Knuizz
                </Heading>

                <Text as="p" size="5" color="gray">
                  <Strong className="text-[var(--accent-11)]">Knuizz</Strong> —
                  это платформа для викторин, созданная в рамках демонстрации
                  навыков full-stack разработки. Проект полностью открыт и
                  продолжает развиваться.
                </Text>
                <Text as="p" size="5" color="gray">
                  Если вы встречаете баги, то смело сообщайте о них мне на
                  почту:{" "}
                  <a href="mailto:r.belovs@inbox.lv">r.belovs@inbox.lv</a> . Это
                  ученический пет-проект, поэтому я уверен, что в нём ещё
                  множество ошибок.
                </Text>
                <Button variant="soft" size="3" asChild className="self-center">
                  <RadixLink
                    href="https://github.com/KnyazLV/Knuizz"
                    target="_blank"
                  >
                    <GitHubLogoIcon />
                    Исходный код
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
                      Быстрые раунды
                    </Heading>
                  </Flex>
                  <Text as="p" className="text-center" size="3" color="gray">
                    Играйте в любое время и в любом месте. Один раунд викторины
                    занимает всего несколько минут, идеально подходит для
                    коротких перерывов.
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
                      REST API
                    </Heading>
                  </Flex>
                  <Text as="p" className="text-center" size="3" color="gray">
                    Полнофункциональное API для разработчиков. Создавайте
                    собственные клиенты, ботов или интегрируйте викторины в свои
                    приложения.
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
                      Рейтинг и прогресс
                    </Heading>
                  </Flex>
                  <Text as="p" className="text-center" size="3" color="gray">
                    Отслеживайте свои достижения, соревнуйтесь с другими
                    игроками и поднимайтесь в таблице лидеров.
                  </Text>
                </Box>
              </AnimatedWhenNotice>
            </Grid>
            <Box pt="3" className="text-center">
              <AnimatedCounter endValue={10000} duration={2500} />
              <Text size="5" color="gray" weight="medium">
                Вопросов в базе
              </Text>
            </Box>
          </Flex>
        </div>
      </Section>
    </>
  );
}
