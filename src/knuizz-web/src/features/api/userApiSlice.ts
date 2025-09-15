// src/features/api/userApiSlice.ts
import { apiSlice } from './apiSlice';

interface UserStatistics {
    userId: string;
    rating: number;
    level: number;
    currentExperience: number;
    totalGamesPlayed: number;
    totalCorrectAnswers: number;
    totalAnswers: number;
    // username?: string;
}

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUserStatistics: builder.query<UserStatistics, string>({
            query: (userId) => `Users/${userId}/statistics`,
            providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
        }),
    }),
});

export const { useGetUserStatisticsQuery } = userApiSlice;

