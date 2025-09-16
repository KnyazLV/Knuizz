// src/components/layout/Footer.tsx
import { Flex, Text } from "@radix-ui/themes";

export default function Footer() {
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
          Made by Rostislavs Belovs
        </Text>
        <Text size="2" color="gray">
          Copyright © {new Date().getFullYear()} All rights reserved
        </Text>
      </Flex>
    </footer>
  );
}
