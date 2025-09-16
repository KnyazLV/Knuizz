// src/features/api/apiSlice.ts
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
} from "../../shared/types/api/api";
import type { RootState } from "../../app/store";
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
    window.location.href = "/auth";
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Leaderboard", "User", "Profile", "UserRank"],
  endpoints: (builder) => ({
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
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserProfileQuery,
  useGetUserStatisticsQuery,
  useUpdateUserProfileMutation,
  useGetMatchHistoryQuery,
  useGetLeaderboardQuery,
  useGetUserRankQuery,
} = apiSlice;
