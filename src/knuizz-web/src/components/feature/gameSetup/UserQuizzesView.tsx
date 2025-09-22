import { useState } from "react";
import {
  useGetUserQuizzesQuery,
  useSearchPublicQuizzesQuery,
} from "../../../features/api/apiSlice.ts";
import { useDebounce } from "../../../hooks/useDebounce";
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  TextField,
  ScrollArea,
  Tooltip,
} from "@radix-ui/themes";
import type { QuizSummary } from "../../../shared/types/api";
import React from "react";

interface UserQuizzesViewProps {
  mode: "my" | "search";
  userId: string;
  onSelectQuiz: (quizId: string) => void;
  selectedQuizId: string | null;
}

// Reusable component to render a list of quizzes
const QuizList = ({
  title,
  quizzes,
  isLoading,
  onSelectQuiz,
  selectedQuizId,
}: {
  title: string;
  quizzes?: QuizSummary[];
  isLoading: boolean;
  onSelectQuiz: (id: string) => void;
  selectedQuizId: string | null;
}) => (
  <Box>
    <Heading size="4" mb="2">
      {title}
    </Heading>
    <ScrollArea
      type="auto"
      scrollbars="vertical"
      style={{
        height: "100%",
        maxHeight: 300,
        border: "1px solid var(--gray-a5)",
        borderRadius: "var(--radius-3)",
      }}
    >
      <Box p="3" style={{ height: 270 }}>
        {isLoading && (
          <Flex justify="center">
            <Spinner />
          </Flex>
        )}
        {!isLoading && !quizzes?.length && (
          <Text color="gray">Список пуст.</Text>
        )}
        <Flex direction="column" gap="3">
          {quizzes?.map((quiz) => {
            const hasDescription =
              quiz.description && quiz.description.length > 0;
            const content = (
              <Box
                key={quiz.id}
                onClick={() => onSelectQuiz(quiz.id)}
                p="2"
                style={{
                  cursor: "pointer",
                  borderRadius: "var(--radius-2)",
                  backgroundColor:
                    selectedQuizId === quiz.id
                      ? "var(--accent-a5)"
                      : "transparent",
                  border: `1px solid ${
                    selectedQuizId === quiz.id
                      ? "var(--accent-a8)"
                      : "var(--gray-a5)"
                  }`,
                }}
                className="quiz-list-item"
              >
                <Text weight="bold" as="div">
                  {quiz.title}
                </Text>
                <Flex
                  direction="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <Text size="2" color="gray">
                    by {quiz.authorName}
                  </Text>
                  <Text size="2" color="gray">
                    {quiz.questionCount} вопросов
                  </Text>
                </Flex>
              </Box>
            );

            return hasDescription ? (
              <Tooltip key={quiz.id} content={quiz.description}>
                {content}
              </Tooltip>
            ) : (
              <React.Fragment key={quiz.id}>{content}</React.Fragment>
            );
          })}
        </Flex>
      </Box>
    </ScrollArea>
  </Box>
);

export default function UserQuizzesView({
  mode,
  userId,
  onSelectQuiz,
  selectedQuizId,
}: UserQuizzesViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: myQuizzes, isLoading: isLoadingMyQuizzes } =
    useGetUserQuizzesQuery(userId, {
      skip: mode !== "my",
    });
  const { data: searchResults, isLoading: isSearching } =
    useSearchPublicQuizzesQuery(debouncedSearchTerm, {
      skip: mode !== "search" || debouncedSearchTerm.length < 3,
    });

  if (mode === "my") {
    return (
      <QuizList
        title="Мои викторины"
        quizzes={myQuizzes}
        isLoading={isLoadingMyQuizzes}
        onSelectQuiz={onSelectQuiz}
        selectedQuizId={selectedQuizId}
      />
    );
  }

  if (mode === "search") {
    return (
      <Flex direction="column" gap="3">
        <TextField.Root
          placeholder="Введите название викторины для поиска..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <QuizList
          title="Результаты поиска"
          quizzes={searchResults}
          isLoading={isSearching}
          onSelectQuiz={onSelectQuiz}
          selectedQuizId={selectedQuizId}
        />
      </Flex>
    );
  }
  return null;
}
