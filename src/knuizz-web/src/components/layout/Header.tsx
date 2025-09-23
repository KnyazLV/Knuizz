// src/components/layout/Header.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flex, Button, SegmentedControl, IconButton } from "@radix-ui/themes";
import { useAppSelector, useAppDispatch } from "@/app/hooks.ts";
import { logout } from "@/features/auth/authSlice.ts";

import logo from "/logo.svg";
import { ExitIcon } from "@radix-ui/react-icons";
import { apiSlice } from "@/features/api/apiSlice.ts";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const goHome = () => {
    navigate("/profile");
  };
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate("/");
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <header
      className={`sticky z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-lg" : ""
      }`}
      style={{ top: 0 }}
    >
      <Flex
        justify="between"
        align="center"
        p="4"
        className={`transition-colors duration-300 ${
          isScrolled
            ? "bg-[var(--color-background)] border-b border-[var(--slate-a6)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <Link to="/">
          <img src={logo} alt="Knuizz Logo" className="h-8 w-auto" />
        </Link>

        <Flex gap="4" align="center">
          <Link
            to="/leaderboard"
            className="text-base font-semibold uppercase transition-all duration-300 border-b-2 border-transparent hover:border-[var(--accent-9)]"
            style={{ color: "white" }}
          >
            {t("header.leaderboard")}
          </Link>
          <SegmentedControl.Root
            style={{ background: "var(--sand-1)" }}
            value={i18n.language}
            onValueChange={handleLanguageChange}
          >
            <SegmentedControl.Item value="ru">RU</SegmentedControl.Item>
            <SegmentedControl.Item value="en">EN</SegmentedControl.Item>
          </SegmentedControl.Root>

          {isAuthenticated ? (
            <>
              <Flex gap="1">
                <Button variant="soft" onClick={goHome}>
                  {t("header.profile")}
                </Button>
                <IconButton variant="soft" color="red" onClick={handleLogout}>
                  <ExitIcon></ExitIcon>
                </IconButton>
              </Flex>
            </>
          ) : (
            <Link to="/auth">
              <Button>{t("header.login")}</Button>
            </Link>
          )}
        </Flex>
      </Flex>
    </header>
  );
}
