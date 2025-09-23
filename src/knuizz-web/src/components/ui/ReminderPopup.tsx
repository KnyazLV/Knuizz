import { useEffect, useState } from "react";
import { Text, Button, Card, Flex } from "@radix-ui/themes";
import { BellIcon } from "@radix-ui/react-icons";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store.ts";
import { useTranslation } from "react-i18next";

const POPUP_STORAGE_KEY = "knz:popup:last-shown";
const SHOW_DELAY = 3000;

export default function ReminderPopup() {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [shouldShow, setShouldShow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }
    const lastShown = localStorage.getItem(POPUP_STORAGE_KEY);
    const now = new Date();

    if (
      !lastShown ||
      now.getTime() - parseInt(lastShown, 10) > 24 * 60 * 60 * 1000
    ) {
      setShouldShow(true);

      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, SHOW_DELAY);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const closePopup = () => {
    setShouldShow(false);
    localStorage.setItem(POPUP_STORAGE_KEY, Date.now().toString());
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <Card
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "320px",
        padding: "16px",
        boxShadow: "rgba(0,0,0,0.2) 0 0 10px",
        zIndex: 100,
        borderRadius: "var(--radius-4)",
        backgroundColor: "var(--gray-1)",
        visibility: isAnimating ? "visible" : "hidden",
      }}
      aria-live="polite"
      role="dialog"
      className={`animate__animated ${isAnimating ? "animate__fadeInUp" : ""}`}
    >
      <Flex justify="center" mb="2">
        <BellIcon
          width="28"
          height="28"
          style={{ color: "var(--accent-11)" }}
        />
      </Flex>
      <Text as="p" size="3" align="center" mb="2">
        {t("reminderPopup.registerPrompt")}
      </Text>
      <Flex justify="center">
        <Button variant="surface" size="2" onClick={closePopup}>
          {t("reminderPopup.gotIt")}
        </Button>
      </Flex>
    </Card>
  );
}
