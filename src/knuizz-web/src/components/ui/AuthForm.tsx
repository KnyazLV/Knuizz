// src/components/ui/AuthForm.tsx
import { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useLoginMutation,
  useRegisterMutation,
} from "../../features/api/apiSlice";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextField,
  Link as RadixLink,
  Callout,
  Checkbox,
  Dialog,
} from "@radix-ui/themes";
import {
  InfoCircledIcon,
  EyeOpenIcon,
  EyeClosedIcon,
} from "@radix-ui/react-icons";

function parseApiError(err: unknown): string {
  const defaultMessage = "Произошла ошибка. Попробуйте снова.";

  if (typeof err === "object" && err !== null && "data" in err) {
    const apiError = err as {
      data?: { message?: string; errors?: Record<string, string[]> } | string;
    };
    const data = apiError.data;

    if (typeof data === "object" && data !== null) {
      if (data.errors) {
        return Object.values(data.errors).flat().join(" ");
      }
      if (data.message) {
        return data.message;
      }
    }
    if (typeof data === "string") {
      return data;
    }
  }
  return defaultMessage;
}

interface AuthFormProps {
  isLoginMode: boolean;
  onToggleMode: () => void;
}

export default function AuthForm({ isLoginMode, onToggleMode }: AuthFormProps) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSuccessDialogOpen, setSuccessDialogOpen] = useState(false);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg("");
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      if (isLoginMode) {
        await login({ email, password, rememberMe }).unwrap();
        navigate("/");
      } else {
        await register({ username, email, password }).unwrap();
        setSuccessDialogOpen(true);
      }
    } catch (err) {
      const message = parseApiError(err);
      setErrorMsg(message);
    }
  };

  const isLoading = isLoggingIn || isRegistering;

  const handleDialogClose = () => {
    setSuccessDialogOpen(false);
    onToggleMode();
  };

  return (
    <>
      <Card size="4" style={{ maxWidth: 450, width: "100%" }}>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Heading align="center" size="7">
              {isLoginMode ? "Вход в аккаунт" : "Создание аккаунта"}
            </Heading>

            {!isLoginMode && (
              <Flex direction="column" gap="1">
                <TextField.Root
                  size="3"
                  placeholder="Имя пользователя"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Text size="1" color="gray">
                  От 3 до 50 символов.
                </Text>
              </Flex>
            )}

            <TextField.Root
              size="3"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Flex direction="column" gap="1">
              <div className="password-field-wrapper">
                <TextField.Root
                  size="3"
                  type={showPassword ? "text" : "password"}
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-button"
                  aria-label={
                    showPassword ? "Скрыть пароль" : "Показать пароль"
                  }
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
              {!isLoginMode && (
                <Text size="1" color="gray">
                  Не менее 6 символов.
                </Text>
              )}
            </Flex>

            <Box
              style={{
                transition:
                  "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
                maxHeight: errorMsg ? "100px" : "0px",
                opacity: errorMsg ? 1 : 0,
                overflow: "hidden",
              }}
            >
              {errorMsg && (
                <Callout.Root color="red" role="alert" size="1">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>{errorMsg}</Callout.Text>
                </Callout.Root>
              )}
            </Box>

            <Text as="label" size="2">
              <Flex gap="2" align="center">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                />
                Запомнить меня
              </Flex>
            </Text>

            <Button size="3" type="submit" disabled={isLoading} highContrast>
              {isLoading
                ? "Загрузка..."
                : isLoginMode
                  ? "Войти"
                  : "Зарегистрироваться"}
            </Button>

            <Text size="2" align="center">
              {isLoginMode ? "Нет аккаунта? " : "Уже есть аккаунт? "}
              <RadixLink onClick={onToggleMode} className="cursor-pointer ml-1">
                {isLoginMode ? "Зарегистрироваться" : "Войти"}
              </RadixLink>
            </Text>
          </Flex>
        </form>
      </Card>

      <Dialog.Root open={isSuccessDialogOpen} onOpenChange={handleDialogClose}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Регистрация успешна</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Ваш аккаунт был успешно создан. Теперь вы можете войти, используя
            свои данные.
          </Dialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Отлично!
              </Button>
            </Dialog.Close>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
