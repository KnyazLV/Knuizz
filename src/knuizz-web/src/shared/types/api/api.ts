// src/shared/types/api/api.ts
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
}

export interface UserStatistics {
  userId: string;
  rating: number;
  level: number;
  currentExperience: number;
  totalGamesPlayed: number;
  totalCorrectAnswers: number;
  totalAnswers: number;
}

export interface UpdateProfileDto {
  username: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string | null;
  rating: number;
  level: number;
}

export interface MatchHistory {
  id: number;
  score: number;
  totalQuestions: number;
  ratingChange: number;
  durationSeconds: number;
  completedAt: string;
  sourceName: string;
}
