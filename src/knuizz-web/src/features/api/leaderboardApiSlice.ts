// // src/features/api/leaderboardApiSlice.ts
// import { apiSlice } from './apiSlice';
//
// interface LeaderboardEntry {
//     userId: string;
//     username: string | null;
//     rating: number;
//     level: number;
// }
//
// export const leaderboardApiSlice = apiSlice.injectEndpoints({
//     endpoints: (builder) => ({
//         getLeaderboard: builder.query<LeaderboardEntry[], number | void>({
//             query: (count = 10) => `Users/leaderboard?count=${count}`,
//             providesTags: (result) =>
//                 result
//                     ? [
//                         ...result.map(({ userId }) => ({ type: 'Leaderboard' as const, id: userId })),
//                         { type: 'Leaderboard', id: 'LIST' },
//                     ]
//                     : [{ type: 'Leaderboard', id: 'LIST' }],
//         }),
//     }),
// });
//
// export const { useGetLeaderboardQuery } = leaderboardApiSlice;
