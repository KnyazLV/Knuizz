// src/pages/AuthPage.tsx
import { useState } from "react";
import AuthForm from "../components/feature/auth/AuthForm.tsx";
import { Button, Flex } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";

export default function AuthPage() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const goHome = () => {
    navigate("/");
  };
  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };

  return (
    <>
      <Button
        onClick={goHome}
        variant="ghost"
        color="gray"
        highContrast
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          zIndex: 10,
          cursor: "pointer",
        }}
        aria-label={t("auth.backToHome")}
      >
        <ArrowLeftIcon width="18" height="18" />
        {t("auth.backToHome")}
      </Button>
      <Flex align="center" justify="center" className="min-h-screen">
        <AuthForm isLoginMode={isLogin} onToggleMode={toggleForm} />
      </Flex>
    </>
  );
}
