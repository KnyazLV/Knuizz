// src/app/routes.tsx

import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AuthPage from "../pages/AuthPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import AuthLayout from '../components/layout/AuthLayout.tsx';
import LeaderboardPage from "../pages/LeaderboardPage.tsx";

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <HomePage />,
            },
            {
              path: '/leaderboard',
              element: <LeaderboardPage />,
            },
        ],
    },
    {
        element: <AuthLayout />,
        children: [
            {
                path: '/auth',
                element: <AuthPage />,
            },
        ],
    },
]);
