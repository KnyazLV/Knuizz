// src/pages/LeaderboardPage.tsx
import {
  Flex,
  Heading,
  Table,
  Card,
  Callout,
  Spinner,
  Text,
  Box,
  Quote,
} from "@radix-ui/themes";
import { useGetLeaderboardQuery } from "../features/api/apiSlice";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import UserStatsHoverCard from "../components/ui/UserStatsHoverCard";
import crownImage from "../shared/assets/crown.png";
import AnimatedWhenNotice from "../components/ui/AnimatedWhenNotice";
import FloatingElement from "../components/ui/FloatingElement.tsx";
import { FloatingElementType } from "../shared/types/FloatingElementType.ts"; // <-- Импортируем наш компонент

export default function LeaderboardPage() {
  const { data: entries = [], isLoading, isError } = useGetLeaderboardQuery(50);

  const topThree = entries.slice(0, 3);
  const podiumOrder =
    topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : [];
  const podiumStyles = [
    {
      height: "170px",
      gradient: "linear-gradient(to bottom, var(--gray-a9), transparent)",
    },
    {
      height: "220px",
      gradient: "linear-gradient(to bottom, var(--amber-a9), transparent)",
    },
    {
      height: "130px",
      gradient: "linear-gradient(to bottom, var(--bronze-a9), transparent)",
    },
  ];

  return (
    <Flex
      direction="column"
      gap="6"
      align="center"
      className="py-8 px-4 w-full inner-container"
    >
      <div
        className="absolute pointer-events-none z-0"
        style={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <div
          className="animate__animated animate__fadeIn"
          style={{ animationDelay: "1.2s" }}
        >
          <FloatingElement
            type={FloatingElementType.Cup}
            size="6rem"
            top="12%"
            left="4%"
            rotation={-15}
            floatDuration="10s"
            opacity={0.08}
          />
          <FloatingElement
            type={FloatingElementType.Globe}
            size="4rem"
            top="75%"
            left="10%"
            rotation={20}
            floatDuration="8s"
            opacity={0.06}
          />
          <FloatingElement
            type={FloatingElementType.Book}
            size="7rem"
            top="20%"
            right="5%"
            rotation={10}
            floatDuration="12s"
            opacity={0.09}
          />
          <FloatingElement
            type={FloatingElementType.Music}
            size="4rem"
            top="60%"
            right="7%"
            rotation={10}
            floatDuration="14s"
            opacity={0.09}
          />
          <FloatingElement
            type={FloatingElementType.Puzzle}
            size="3.5rem"
            top="85%"
            right="12%"
            rotation={-25}
            floatDuration="9s"
            opacity={0.07}
          />
          <FloatingElement
            type={FloatingElementType.Brain}
            size="5rem"
            top="50%"
            left="15%"
            rotation={5}
            floatDuration="11s"
            opacity={0.08}
          />
          <FloatingElement
            type={FloatingElementType.Flask}
            size="4.5rem"
            top="80%"
            right="50%"
            rotation={15}
            floatDuration="7s"
            opacity={0.07}
          />
        </div>
      </div>

      <AnimatedWhenNotice animationName="fadeInUp">
        <Box className="text-center">
          <Heading size="8" className="uppercase text-gradient">
            Таблица лидеров
          </Heading>
          <Quote>Scientia potentia est</Quote>
          {/*<Text style={{ fontStyle: "italic" }}>Scientia potentia est</Text>*/}
        </Box>
      </AnimatedWhenNotice>

      {isLoading && (
        <Flex
          justify="center"
          align="center"
          className="w-full"
          style={{ minHeight: "300px" }}
        >
          <Spinner size="3" />
        </Flex>
      )}

      {isError && (
        <Flex justify="center" align="center">
          <Callout.Root color="red">
            <Callout.Icon>
              <InfoCircledIcon />
            </Callout.Icon>
            <Callout.Text>
              Ошибка загрузки таблицы лидеров. Пожалуйста, попробуйте обновить
              страницу.
            </Callout.Text>
          </Callout.Root>
        </Flex>
      )}
      {!isLoading && !isError && topThree.length >= 3 && (
        <>
          <Flex
            align="end"
            justify="center"
            gap="3"
            className="w-full max-w-lg min-h-[300px]"
          >
            {podiumOrder.map((player, index) => {
              const place = ["2nd", "1st", "3rd"][index];
              const style = podiumStyles[index];

              return (
                <AnimatedWhenNotice
                  key={player.userId}
                  animationName="fadeInUp"
                  className="flex-1"
                >
                  <Flex
                    direction="column-reverse"
                    align="center"
                    className="text-center h-full"
                    style={{ height: style.height }}
                  >
                    <Box
                      style={{ background: style.gradient, borderRadius: 5 }}
                      className="w-full h-full rounded-t-md"
                    >
                      <Flex align="center" justify="center" className="h-full">
                        <Text
                          size="9"
                          weight="bold"
                          style={{ color: "var(--slate-a5)" }}
                        >
                          {place}
                        </Text>
                      </Flex>
                    </Box>
                    <Flex
                      direction="column"
                      align="center"
                      gap="1"
                      className="mb-4 relative"
                    >
                      {place === "1st" && (
                        <img
                          src={crownImage}
                          alt="Crown"
                          className="mb-1 crown-glow"
                          style={{
                            position: "absolute",
                            top: -30,
                            width: 30,
                          }}
                        />
                      )}
                      <UserStatsHoverCard
                        userId={player.userId}
                        username={player.username || "Неизвестный"}
                      >
                        <Flex direction="column" align="center">
                          <Text size="6" weight="bold" trim="both">
                            {player.username || "Неизвестный"}
                          </Text>
                          <Text size="2" color="gray">
                            Рейтинг: {player.rating}
                          </Text>
                        </Flex>
                      </UserStatsHoverCard>
                    </Flex>
                  </Flex>
                </AnimatedWhenNotice>
              );
            })}
          </Flex>

          <AnimatedWhenNotice
            animationName="fadeInUp"
            delay="1s"
            className="w-full max-w-4xl"
          >
            <Card className="w-full max-w-4xl">
              <Table.Root variant="surface" size="3">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell width="15%" justify="start">
                      Место
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell justify="center">
                      Игрок
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell width="15%" justify="end">
                      Рейтинг
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {entries.slice(3).map((entry, index) => (
                    <Table.Row key={entry.userId} align="center">
                      <Table.RowHeaderCell justify="start">
                        <Text color="gray">{index + 4}</Text>
                      </Table.RowHeaderCell>

                      <Table.Cell justify="center">
                        <div style={{ display: "inline-block" }}>
                          <UserStatsHoverCard
                            userId={entry.userId}
                            username={entry.username || "Неизвестный"}
                          >
                            <Text weight="bold">
                              {entry.username || "Неизвестный"}
                            </Text>
                          </UserStatsHoverCard>
                        </div>
                      </Table.Cell>

                      <Table.Cell justify="end">
                        <Text weight="medium">{entry.rating}</Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card>
          </AnimatedWhenNotice>
        </>
      )}
    </Flex>
  );
}
