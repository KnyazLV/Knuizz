import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Flex, Button, SegmentedControl, IconButton } from "@radix-ui/themes";
import { useAppSelector, useAppDispatch } from "@/app/hooks.ts";
import { logout } from "@/features/auth/authSlice.ts";

import logo from "/logo.svg";
import { ExitIcon } from "@radix-ui/react-icons";
import { apiSlice } from "@/features/api/apiSlice.ts";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen((open) => !open);
  };
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const goHome = () => navigate("/profile");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate("/");
  };

  const handleLanguageChange = (language: string) => {
    setMenuOpen(false);
    i18n.changeLanguage(language);
  };

  return (
    <header
      className={`sticky z-50 transition-all duration-300 ${isScrolled ? "backdrop-blur-lg" : ""}`}
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

        {isMobile ? (
          <>
            <div id="outer-container">
              <div
                className="hamburger-icon"
                id="icon"
                onClick={toggleMenu}
                style={{ position: "relative", cursor: "pointer" }}
                aria-label="Toggle menu"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    toggleMenu();
                  }
                }}
              >
                <div id="a" className={`icon-1 ${menuOpen ? "a" : ""}`} />
                <div id="b" className={`icon-2 ${menuOpen ? "c" : ""}`} />
                <div id="c" className={`icon-3 ${menuOpen ? "b" : ""}`} />
                <div className="clear"></div>
              </div>
              <nav id="nav" className={menuOpen ? "show" : ""}>
                <ul>
                  <Link
                    to="/leaderboard"
                    className="menu-item text-base font-semibold uppercase"
                    style={{ color: "white" }}
                  >
                    {t("header.leaderboard")}
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/profile"
                      className="menu-item text-base font-semibold uppercase"
                      style={{ color: "white" }}
                    >
                      {t("header.profile")}
                    </Link>
                  )}
                  {isAuthenticated ? (
                    <Button
                      variant="soft"
                      color="red"
                      className="menu-item flex gap-2 items-center mt-4 justify-start"
                      onClick={handleLogout}
                      style={{ fontSize: 18 }}
                    >
                      <ExitIcon /> {t("header.logout")}
                    </Button>
                  ) : (
                    <Link to="/auth" className="menu-item">
                      <Button variant="solid">{t("header.login")}</Button>
                    </Link>
                  )}
                  <div className="mt-5">
                    <SegmentedControl.Root
                      value={i18n.language}
                      onValueChange={handleLanguageChange}
                      className="w-full"
                    >
                      <SegmentedControl.Item value="ru">
                        RU
                      </SegmentedControl.Item>
                      <SegmentedControl.Item value="en">
                        EN
                      </SegmentedControl.Item>
                    </SegmentedControl.Root>
                  </div>
                </ul>
              </nav>
            </div>
          </>
        ) : (
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
              <Flex gap="1">
                <Button variant="soft" onClick={goHome}>
                  {t("header.profile")}
                </Button>
                <IconButton variant="soft" color="red" onClick={handleLogout}>
                  <ExitIcon />
                </IconButton>
              </Flex>
            ) : (
              <Link to="/auth">
                <Button>{t("header.login")}</Button>
              </Link>
            )}
          </Flex>
        )}
      </Flex>
    </header>
  );
}
