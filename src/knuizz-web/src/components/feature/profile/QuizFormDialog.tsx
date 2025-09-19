// src/components/features/quiz/QuizFormDialog.tsx
import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useGetQuizByIdQuery,
} from "../../../features/api/apiSlice.ts";
import type { CreateQuizRequest } from "../../../shared/types/api";
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

  // Fetch quiz data only in edit mode when the dialog is open
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
      required: "Нужен хотя бы один вопрос",
      minLength: 1,
      maxLength: { value: 30, message: "Максимум 30 вопросов" },
    },
  });

  useEffect(() => {
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
        toast.success("Викторина успешно обновлена!");
      } else {
        await createQuiz(data).unwrap();
        toast.success("Викторина успешно создана!");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(
        isEditMode ? "Ошибка при обновлении." : "Ошибка при создании.",
      );
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 800 }}>
        <Dialog.Title>
          {isEditMode ? "Редактирование викторины" : "Создание новой викторины"}
        </Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {isEditMode
            ? "Измените данные вашей викторины."
            : "Заполните информацию о викторине и добавьте до 30 вопросов."}
        </Dialog.Description>

        {isLoadingQuiz ? (
          <Flex justify="center" p="8">
            <Spinner size="3" />
          </Flex>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* The form JSX remains identical */}
            <Flex direction="column" gap="4">
              <label>
                <Text as="div" size="2" mb="1" weight="bold">
                  Название викторины
                </Text>
                <TextField.Root
                  placeholder="Например, 'Столицы мира'"
                  {...register("title", {
                    required: "Название обязательно",
                    minLength: { value: 3, message: "Минимум 3 символа" },
                    maxLength: { value: 255, message: "Максимум 255 символов" },
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
                  Описание (необязательно)
                </Text>
                <TextArea
                  placeholder="Краткое описание вашей викторины"
                  {...register("description")}
                />
              </label>

              <Heading size="4" mt="3">
                Вопросы
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
                    <Text weight="bold">Вопрос {index + 1}</Text>
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
                    placeholder="Текст вопроса"
                    {...register(`questions.${index}.questionText`, {
                      required: "Текст вопроса не может быть пустым",
                    })}
                  />
                  {errors.questions?.[index]?.questionText && (
                    <Text size="1" color="red">
                      {errors.questions?.[index]?.questionText?.message}
                    </Text>
                  )}

                  <Text size="2" weight="bold" mt="2">
                    Варианты ответа (выберите правильный)
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
                                placeholder={`Вариант ${optionIndex + 1}`}
                                {...register(
                                  `questions.${index}.options.${optionIndex}`,
                                  {
                                    required:
                                      "Вариант ответа не может быть пустым",
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
                      Все 4 варианта ответа обязательны
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
                  <PlusIcon /> Добавить вопрос
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
                    Произошла ошибка на сервере. Попробуйте позже.
                  </Callout.Text>
                </Callout.Root>
              )}
            </Flex>

            <Flex gap="3" mt="6" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray" type="button">
                  Отмена
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={!isValid || isLoading}>
                {isLoading
                  ? "Сохранение..."
                  : isEditMode
                    ? "Сохранить изменения"
                    : "Создать викторину"}
              </Button>
            </Flex>
          </form>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
