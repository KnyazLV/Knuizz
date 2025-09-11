// src/features/auth/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
// import type { PayloadAction } from '@reduxjs/toolkit'; // Используем 'import type'
import { apiSlice } from '../api/apiSlice';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
}

const token = localStorage.getItem('token');

const initialState: AuthState = {
    token: token,
    isAuthenticated: !!token,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
    },
    // Здесь происходит магия! Мы "слушаем" результат работы нашего apiSlice.
    extraReducers: (builder) => {
        // Когда эндпоинт `login` из `apiSlice` успешно завершается...
        builder.addMatcher(
            apiSlice.endpoints.login.matchFulfilled,
            (state, action) => {
                // ...мы берем токен из ответа сервера...
                const token = action.payload.token;
                // ...и сохраняем его!
                state.token = token;
                state.isAuthenticated = true;
                localStorage.setItem('token', token);
            }
        );
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
