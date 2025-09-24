// src/components/features/quiz/UserQuizzesTable.tsx
import {
  useDeleteQuizMutation,
  useGetUserQuizzesQuery,
  useUpdateQuizPublicationMutation,
} from "@/features/api/apiSlice.ts";
import {
  Table,
  Flex,
  Spinner,
  Callout,
  Text,
  Badge,
  IconButton,
  Heading,
  Box,
  Card,
  Button,
  AlertDialog,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  Pencil2Icon,
  TrashIcon,
  LockClosedIcon,
  LockOpen1Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import QuizFormDialog from "./QuizFormDialog.tsx";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

interface UserQuizzesTableProps {
  userId: string;
}

export default function UserQuizzesTable({ userId }: UserQuizzesTableProps) {
  const { t } = useTranslation();
  const {
    data: quizzes,
    isLoading,
    isError,
  } = useGetUserQuizzesQuery(userId, {
    skip: !userId,
  });

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    quizId?: string;
  }>({ open: false, quizId: undefined });

  const [deleteQuiz] = useDeleteQuizMutation();
  const [updateQuizPublication] = useUpdateQuizPublicationMutation();

  const handleDeleteQuiz = async (id: string) => {
    try {
      await deleteQuiz(id).unwrap();
      toast.success(t("profile.quizTable.toastDeleted"));
    } catch {
      toast.error(t("profile.quizTable.toastDeleteError"));
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      await updateQuizPublication({ id, isPublished: !isPublished }).unwrap();
      const newStatus = t(
        isPublished
          ? "profile.quizTable.statusPrivate"
          : "profile.quizTable.statusPublic",
      );
      toast.success(
        t("profile.quizTable.toastStatusChanged", { status: newStatus }),
      );
    } catch {
      toast.error(t("profile.quizTable.toastStatusError"));
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" p="8">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex justify="center" align="center" p="8">
        <Callout.Root color="red">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{t("profile.quizTable.errorLoading")}</Callout.Text>
        </Callout.Root>
      </Flex>
    );
  }

  return (
    <>
      <Card className="w-full">
        <Flex direction="column" gap="4" p="4">
          <Flex justify="between" align="center">
            <Heading>{t("profile.quizTable.title")}</Heading>
            <Button
              onClick={() => setDialogState({ open: true, quizId: undefined })}
            >
              <PlusIcon width="16" height="16" />
              {t("profile.quizTable.createBtn")}
            </Button>
          </Flex>

          {quizzes && quizzes.length > 0 ? (
            <Table.Root variant="surface">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell justify="start">
                    {t("profile.quizTable.nameHeader")}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="center">
                    {t("profile.quizTable.createdHeader")}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="center">
                    {t("profile.quizTable.questionsHeader")}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="center">
                    {t("profile.quizTable.statusHeader")}
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell justify="end">
                    {t("profile.quizTable.actionsHeader")}
                  </Table.ColumnHeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {quizzes.map((quiz) => (
                  <Table.Row align="center" key={quiz.id}>
                    <Table.Cell justify="start">
                      <Text weight="bold">{quiz.title}</Text>
                    </Table.Cell>
                    <Table.Cell justify="center">
                      {new Intl.DateTimeFormat(i18n.language, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }).format(new Date(quiz.createdAt))}
                    </Table.Cell>
                    <Table.Cell justify="center">
                      {quiz.questionCount}
                    </Table.Cell>
                    <Table.Cell justify="center">
                      <Badge color={quiz.isPublished ? "green" : "gray"}>
                        {quiz.isPublished
                          ? t("profile.quizTable.statusPublic")
                          : t("profile.quizTable.statusPrivate")}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell justify="end">
                      <Flex justify="end" gap="3">
                        <IconButton
                          title={t("profile.quizTable.editTooltip")}
                          variant="soft"
                          onClick={() =>
                            setDialogState({ open: true, quizId: quiz.id })
                          }
                        >
                          <Pencil2Icon width="18" height="18" />
                        </IconButton>
                        <IconButton
                          title={
                            quiz.isPublished
                              ? t("profile.quizTable.makePrivateTooltip")
                              : t("profile.quizTable.makePublicTooltip")
                          }
                          variant="soft"
                          color="blue"
                          onClick={() =>
                            handleTogglePublish(quiz.id, quiz.isPublished)
                          }
                        >
                          {quiz.isPublished ? (
                            <LockClosedIcon width="18" height="18" />
                          ) : (
                            <LockOpen1Icon width="18" height="18" />
                          )}
                        </IconButton>
                        <AlertDialog.Root>
                          <AlertDialog.Trigger>
                            <IconButton
                              title={t("profile.quizTable.deleteTooltip")}
                              variant="soft"
                              color="red"
                            >
                              <TrashIcon width="18" height="18" />
                            </IconButton>
                          </AlertDialog.Trigger>
                          <AlertDialog.Content style={{ maxWidth: 450 }}>
                            <AlertDialog.Title>
                              {t("profile.quizTable.confirmDeleteTitle")}
                            </AlertDialog.Title>
                            <AlertDialog.Description size="2">
                              {t("profile.quizTable.confirmDeleteDescription", {
                                title: quiz.title,
                              })}
                            </AlertDialog.Description>
                            <Flex gap="3" mt="4" justify="end">
                              <AlertDialog.Cancel>
                                <Button variant="soft" color="gray">
                                  {t("profile.quizTable.cancelBtn")}
                                </Button>
                              </AlertDialog.Cancel>
                              <AlertDialog.Action>
                                <Button
                                  variant="solid"
                                  color="red"
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                >
                                  {t("profile.quizTable.deleteBtn")}
                                </Button>
                              </AlertDialog.Action>
                            </Flex>
                          </AlertDialog.Content>
                        </AlertDialog.Root>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          ) : (
            <Box
              p="6"
              style={{
                border: "1px dashed var(--gray-a7)",
                borderRadius: "var(--radius-3)",
              }}
            >
              <Text color="gray" align="center">
                {t("profile.quizTable.noQuizzes")}
              </Text>
            </Box>
          )}
        </Flex>
      </Card>
      <QuizFormDialog
        isOpen={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
        quizId={dialogState.quizId}
      />
    </>
  );
}
