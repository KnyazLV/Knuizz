import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface QuestionDto {
    id: string | null;
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
}

interface QuizRequestParams {
    sourceName: 'trivia_api' | 'wwtbm_ru' | 'wwtbm_en';
    count?: number;
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5130/api/' }),
    endpoints: (builder) => ({
        getQuizFromSource: builder.query<QuestionDto[], QuizRequestParams>({
            query: ({ sourceName, count = 10 }) => `quizzes/source/${sourceName}?count=${count}`,
        }),
        // login: builder.mutation(...)
    }),
});

export const { useGetQuizFromSourceQuery } = apiSlice;
