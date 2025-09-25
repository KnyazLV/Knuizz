import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateProfileDto,
  UserProfile,
  UserStatistics,
  LeaderboardEntry,
  MatchHistory,
  QuizSummary,
  CreateQuizRequest,
  QuizDetails,
  UpdateQuizRequest,
  Question,
  MatchResult,
} from "@/shared/types/api";
import type { RootState } from "@/app/store.ts";
import { logout } from "../auth/authSlice.ts";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5130/api/",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
    // window.location.href = "/auth";
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Leaderboard",
    "User",
    "Profile",
    "UserRank",
    "UserQuiz",
    "MatchHistory",
  ],
  endpoints: (builder) => ({
    //Auth
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/Auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<void, RegisterRequest>({
      query: (userInfo) => ({
        url: "/Auth/register",
        method: "POST",
        body: userInfo,
      }),
    }),
    // User info
    getUserProfile: builder.query<UserProfile, void>({
      query: () => "/Users/profile",
      providesTags: ["Profile"],
    }),
    getUserStatistics: builder.query<UserStatistics, string>({
      query: (userId) => `/Users/${userId}/statistics`,
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),
    getUserRank: builder.query<number, void>({
      query: () => "/Users/profile/rank",
      providesTags: ["UserRank"],
    }),
    updateUserProfile: builder.mutation<void, UpdateProfileDto>({
      query: (profileData) => ({
        url: "/Users/profile",
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: [
        "Profile",
        "UserRank",
        { type: "Leaderboard", id: "LIST" },
      ],
    }),
    // LeaderBoard and History
    getLeaderboard: builder.query<LeaderboardEntry[], number | void>({
      query: (count = 100) => `Users/leaderboard?count=${count}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ userId }) => ({
                type: "Leaderboard" as const,
                id: userId,
              })),
              { type: "Leaderboard", id: "LIST" },
            ]
          : [{ type: "Leaderboard", id: "LIST" }],
    }),
    getMatchHistory: builder.query<MatchHistory[], number | void>({
      query: (count = 5) => `Users/profile/match-history?count=${count}`,
      providesTags: ["MatchHistory"],
    }),
    submitMatchResult: builder.mutation<
      MatchResult,
      {
        sourceName: string;
        userQuizId?: string | null;
        score: number;
        totalQuestions: number;
        durationSeconds: number;
      }
    >({
      query: (matchData) => ({
        url: "/quizzes/submit-result",
        method: "POST",
        body: matchData,
      }),
      invalidatesTags: ["MatchHistory", "Profile", "UserRank"],
    }),
    // Quizzes
    getUserQuizzes: builder.query<QuizSummary[], string>({
      query: (authorId) => `/quizzes/by-author/${authorId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "UserQuiz" as const, id })),
              { type: "UserQuiz", id: "LIST" },
            ]
          : [{ type: "UserQuiz", id: "LIST" }],
    }),
    getQuizById: builder.query<QuizDetails, string>({
      query: (id) => `/quizzes/${id}`,
      providesTags: (_result, _error, id) => [{ type: "UserQuiz", id }],
    }),
    createQuiz: builder.mutation<void, CreateQuizRequest>({
      query: (quizData) => ({
        url: "/quizzes",
        method: "POST",
        body: quizData,
      }),
      invalidatesTags: [{ type: "UserQuiz", id: "LIST" }],
    }),
    updateQuiz: builder.mutation<void, UpdateQuizRequest>({
      query: ({ id, data }) => ({
        url: `/quizzes/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "UserQuiz", id: "LIST" },
        { type: "UserQuiz", id },
      ],
    }),
    updateQuizPublication: builder.mutation<
      void,
      { id: string; isPublished: boolean }
    >({
      query: ({ id, isPublished }) => ({
        url: `/quizzes/${id}/publish`,
        method: "PATCH",
        body: { isPublished },
      }),
      async onQueryStarted(
        { id, isPublished },
        { dispatch, queryFulfilled, getState },
      ) {
        const profileResult =
          apiSlice.endpoints.getUserProfile.select()(getState());

        let userId;
        if (profileResult.isSuccess) {
          userId = profileResult.data.id;
        }
        if (!userId) {
          return;
        }

        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getUserQuizzes", userId, (draft) => {
            const quiz = draft.find((q) => q.id === id);
            if (quiz) {
              quiz.isPublished = isPublished;
            }
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: "UserQuiz", id }],
    }),

    deleteQuiz: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "UserQuiz", id: "LIST" }],
    }),
    searchPublicQuizzes: builder.query<QuizSummary[], string>({
      query: (searchTerm) =>
        `/quizzes/search?query=${encodeURIComponent(searchTerm)}`,
    }),
    getQuestionsFromSource: builder.query<
      Question[],
      { source: string; count?: number }
    >({
      query: ({ source, count = 20 }) =>
        `/quizzes/source/${source}?count=${count}`,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserProfileQuery,
  useGetUserStatisticsQuery,
  useUpdateUserProfileMutation,
  useGetMatchHistoryQuery,
  useSubmitMatchResultMutation,
  useGetLeaderboardQuery,
  useGetUserRankQuery,
  useGetUserQuizzesQuery,
  useCreateQuizMutation,
  useGetQuizByIdQuery,
  useUpdateQuizMutation,
  useUpdateQuizPublicationMutation,
  useDeleteQuizMutation,
  useSearchPublicQuizzesQuery,
  useGetQuestionsFromSourceQuery,
  useLazyGetQuestionsFromSourceQuery,
  useLazyGetQuizByIdQuery,
} = apiSlice;
