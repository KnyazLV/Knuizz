import { useEffect, useState } from "react";
import {
  Dialog,
  Button,
  Flex,
  Heading,
  Text,
  Separator,
} from "@radix-ui/themes";
import { useSound } from "../../hooks/useSound.tsx";
import { StarFilledIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import AnimatedNumber from "./AnimatedNumber.tsx";
import { useTranslation } from "react-i18next";

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function LevelUpModal({
  oldLevel,
  newLevel,
  isOpen,
  onClose,
}: LevelUpModalProps) {
  const { t } = useTranslation();
  const { playSound } = useSound();
  const [isAnimatingNumber, setIsAnimatingNumber] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playSound("levelup", { volume: 0.5 });
      const timer = setTimeout(() => setIsAnimatingNumber(true), 400);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingNumber(false);
    }
  }, [isOpen, playSound]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content
        className="animate__animated animate__zoomIn"
        style={{ maxWidth: 480 }}
      >
        <Flex direction="column" align="center" gap="4">
          <StarFilledIcon width="56" height="56" color="var(--accent-9)" />

          <Dialog.Title size="8" mt="2">
            {t("game.levelUp.header")}
          </Dialog.Title>

          <Separator size="4" my="2" style={{ width: "60%" }} />

          <Text size="3" color="gray">
            {t("game.levelUp.message")}
          </Text>
          <Flex align="center" justify="center" gap="6" my="3">
            <Flex direction="column" align="center" gap="1">
              <Heading size="9" weight="light">
                {oldLevel}
              </Heading>
            </Flex>

            <ArrowRightIcon
              width="32"
              height="32"
              color="var(--accent-9)"
              style={{ flexShrink: 0 }}
            />

            <Flex direction="column" align="center" gap="1">
              <Heading size="9" style={{ color: "var(--accent-9)" }}>
                {isAnimatingNumber ? (
                  <AnimatedNumber from={oldLevel} to={newLevel} />
                ) : (
                  oldLevel
                )}
              </Heading>
            </Flex>
          </Flex>

          <Dialog.Close>
            <Button
              size="3"
              mt="3"
              onClick={onClose}
              variant="soft"
              highContrast
            >
              {t("game.levelUp.gotIt")}
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
