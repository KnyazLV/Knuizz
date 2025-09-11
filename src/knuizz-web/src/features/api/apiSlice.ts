// src/features/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';

// Определяем типы для регистрации, согласно вашей OpenAPI спецификации
interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

// Типы для логина
interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    token: string;
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5130/api/',
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: [],
    endpoints: (builder) => ({
        // Эндпоинт для логина (уже был)
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (credentials) => ({
                url: '/Auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        // НОВЫЙ эндпоинт для регистрации
        register: builder.mutation<void, RegisterRequest>({
            query: (userInfo) => ({
                url: '/Auth/register',
                method: 'POST',
                body: userInfo,
            }),
        }),
    }),
});

// Экспортируем ОБА хука
export const { useLoginMutation, useRegisterMutation } = apiSlice;
