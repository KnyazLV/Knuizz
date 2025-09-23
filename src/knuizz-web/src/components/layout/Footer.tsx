// src/components/layout/Footer.tsx
import { Flex, Text } from "@radix-ui/themes";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  return (
    <footer
      className="border-t border-[var(--slate-a6)]"
      style={{
        background: "var(--color-background)",
      }}
    >
      <Flex
        direction={{ initial: "column", sm: "row" }}
        justify={{ initial: "center", sm: "between" }}
        align="center"
        px="6"
        py="5"
        gap="4"
      >
        <Text size="2" color="gray">
          {t("footer.madeBy")}
        </Text>
        <Text size="2" color="gray">
          {t("footer.copyright", { year: currentYear })}
        </Text>
      </Flex>
    </footer>
  );
}
