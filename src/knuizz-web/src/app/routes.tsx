// src/app/routes.tsx

import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import AuthPage from "../pages/AuthPage.tsx";
import MainLayout from "../components/layout/MainLayout.tsx";
import AuthLayout from '../components/layout/AuthLayout.tsx';

// export const router = createBrowserRouter([
//     {
//         path: '/',
//         element: <App />,
//         children: [
//             {
//                 index: true,
//                 element: <HomePage />,
//             },
//             {
//                 path: 'login',
//                 element: <AuthPage />,
//             },
//         ],
//     },
// ]);

export const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            {
                path: '/',
                element: <HomePage />,
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
