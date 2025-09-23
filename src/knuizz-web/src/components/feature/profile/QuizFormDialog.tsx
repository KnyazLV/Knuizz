// src/components/features/quiz/QuizFormDialog.tsx
import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useGetQuizByIdQuery,
} from "@/features/api/apiSlice.ts";
import type { CreateQuizRequest } from "@/shared/types/api";
import {
  Dialog,
  Button,
  Flex,
  Text,
  TextField,
  TextArea,
  Callout,
  IconButton,
  RadioGroup,
  Heading,
  Spinner,
} from "@radix-ui/themes";
import { PlusIcon, TrashIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface QuizFormDialogProps {
  quizId?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuizFormDialog({
  quizId,
  isOpen,
  onOpenChange,
}: QuizFormDialogProps) {
  const isEditMode = !!quizId;
  const { t } = useTranslation();

  const { data: existingQuiz, isLoading: isLoadingQuiz } = useGetQuizByIdQuery(
    quizId!,
    { skip: !isEditMode || !isOpen },
  );

  const [createQuiz, { isLoading: isCreating, error: createError }] =
    useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating, error: updateError }] =
    useUpdateQuizMutation();
  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateQuizRequest>({
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      questions: [
        { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
    rules: {
      required: t("profile.quizForm.validation.atLeastOneQuestion"),
      minLength: 1, // This is a logic rule, no message needed
      maxLength: {
        value: 30,
        message: t("profile.quizForm.validation.maxQuestions"),
      },
    },
  });

  useEffect(() => {
    // Logic to reset form, no translation needed here
    if (isEditMode && existingQuiz) {
      reset(existingQuiz);
    }
    if (!isEditMode && isOpen) {
      reset({
        title: "",
        description: "",
        questions: [
          {
            questionText: "",
            options: ["", "", "", ""],
            correctAnswerIndex: 0,
          },
        ],
      });
    }
  }, [existingQuiz, isEditMode, isOpen, reset]);

  const onSubmit = async (data: CreateQuizRequest) => {
    try {
      if (isEditMode) {
        await updateQuiz({ id: quizId!, data }).unwrap();
        toast.success(t("profile.quizForm.toastUpdated"));
      } else {
        await createQuiz(data).unwrap();
        toast.success(t("profile.quizForm.toastCreated"));
      }
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error(
        isEditMode
          ? t("profile.quizForm.toastUpdateError")
          : t("profile.quizForm.toastCreateError"),
      );
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 800 }}>
        <Dialog.Title>
          {isEditMode
            ? t("profile.quizForm.editTitle")
            : t("profile.quizForm.createTitle")}
        </Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {isEditMode
            ? t("profile.quizForm.editDescription")
            : t("profile.quizForm.createDescription")}
        </Dialog.Description>

        {isLoadingQuiz ? (
          <Flex justify="center" p="8">
            <Spinner size="3" />{" "}
            <Text ml="2">{t("profile.quizForm.loading")}</Text>
          </Flex>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap="4">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  {t("profile.quizForm.quizNameLabel")}
                </Text>
                <TextField.Root
                  placeholder={t("profile.quizForm.quizNamePlaceholder")}
                  {...register("title", {
                    required: t("profile.quizForm.validation.titleRequired"),
                    minLength: {
                      value: 3,
                      message: t("profile.quizForm.validation.titleMinLength"),
                    },
                    maxLength: {
                      value: 255,
                      message: t("profile.quizForm.validation.titleMaxLength"),
                    },
                  })}
                />
                {errors.title && (
                  <Text size="1" color="red">
                    {errors.title.message}
                  </Text>
                )}
              </label>

              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  {t("profile.quizForm.quizDescriptionLabel")}
                </Text>
                <TextArea
                  placeholder={t("profile.quizForm.quizDescriptionPlaceholder")}
                  {...register("description")}
                />
              </label>

              <Heading size="4" mt="3">
                {t("profile.quizForm.questionsTitle")}
              </Heading>

              {fields.map((field, index) => (
                <Flex
                  key={field.id}
                  direction="column"
                  gap="3"
                  p="4"
                  style={{
                    border: "1px solid var(--gray-a5)",
                    borderRadius: "var(--radius-3)",
                  }}
                >
                  <Flex justify="between" align="center">
                    <Text weight="bold">
                      {t("profile.quizForm.questionLabel", {
                        index: index + 1,
                      })}
                    </Text>
                    {fields.length > 1 && (
                      <IconButton
                        color="red"
                        variant="soft"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        <TrashIcon />
                      </IconButton>
                    )}
                  </Flex>

                  <TextArea
                    placeholder={t("profile.quizForm.questionPlaceholder")}
                    {...register(`questions.${index}.questionText`, {
                      required: t(
                        "profile.quizForm.validation.questionTextRequired",
                      ),
                    })}
                  />
                  {errors.questions?.[index]?.questionText && (
                    <Text size="1" color="red">
                      {errors.questions[index]?.questionText?.message}
                    </Text>
                  )}

                  <Text size="2" weight="bold" mt="2">
                    {t("profile.quizForm.optionsLabel")}
                  </Text>
                  <Controller
                    name={`questions.${index}.correctAnswerIndex`}
                    control={control}
                    render={({ field: radioField }) => (
                      <RadioGroup.Root
                        onValueChange={(value) =>
                          radioField.onChange(parseInt(value))
                        }
                        value={String(radioField.value)}
                      >
                        <Flex direction="column" gap="2">
                          {[0, 1, 2, 3].map((optionIndex) => (
                            <Flex key={optionIndex} gap="2" align="center">
                              <RadioGroup.Item value={String(optionIndex)} />
                              <TextField.Root
                                style={{ flexGrow: 1 }}
                                placeholder={t(
                                  "profile.quizForm.optionPlaceholder",
                                  { index: optionIndex + 1 },
                                )}
                                {...register(
                                  `questions.${index}.options.${optionIndex}`,
                                  {
                                    required: t(
                                      "profile.quizForm.validation.optionRequired",
                                    ),
                                  },
                                )}
                              />
                            </Flex>
                          ))}
                        </Flex>
                      </RadioGroup.Root>
                    )}
                  />
                  {errors.questions?.[index]?.options && (
                    <Text size="1" color="red">
                      {t("profile.quizForm.validation.allOptionsRequired")}
                    </Text>
                  )}
                </Flex>
              ))}

              {fields.length < 30 && (
                <Button
                  type="button"
                  variant="soft"
                  onClick={() =>
                    append({
                      questionText: "",
                      options: ["", "", "", ""],
                      correctAnswerIndex: 0,
                    })
                  }
                >
                  <PlusIcon /> {t("profile.quizForm.addQuestionBtn")}
                </Button>
              )}
              {errors.questions?.root && (
                <Text size="1" color="red">
                  {errors.questions.root.message}
                </Text>
              )}

              {error && (
                <Callout.Root color="red" mt="2">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    {t("profile.quizForm.errorServer")}
                  </Callout.Text>
                </Callout.Root>
              )}
            </Flex>

            <Flex gap="3" mt="6" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray" type="button">
                  {t("profile.quizForm.cancelBtn")}
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={!isValid || isLoading}>
                {isLoading
                  ? t("profile.quizForm.saving")
                  : isEditMode
                    ? t("profile.quizForm.saveChangesBtn")
                    : t("profile.quizForm.createQuizBtn")}
              </Button>
            </Flex>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
