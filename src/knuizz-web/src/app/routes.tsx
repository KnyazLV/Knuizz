import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import AuthPage from "../pages/AuthPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import AuthLayout from "../components/layout/AuthLayout.tsx";
import LeaderboardPage from "../pages/LeaderboardPage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";
import GameRouteGuard from "../components/feature/game/GameRouteGuard.tsx";
import GamePage from "../pages/GamePage.tsx";
import ErrorPage from "@/pages/ErrorPage.tsx";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/leaderboard",
        element: <LeaderboardPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        element: <GameRouteGuard />,
        children: [
          {
            path: "game",
            element: <GamePage />,
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />, // также можете добавить сюда
    children: [
      {
        path: "/auth",
        element: <AuthPage />,
      },
    ],
  },
]);
