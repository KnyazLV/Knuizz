// src/features/auth/authSlice.ts
import { createSlice } from '@reduxjs/toolkit';
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
    extraReducers: (builder) => {
        builder.addMatcher(
            apiSlice.endpoints.login.matchFulfilled,
            (state, action) => {
                const token = action.payload.token;
                state.token = token;
                state.isAuthenticated = true;
                localStorage.setItem('token', token);
            }
        );
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
