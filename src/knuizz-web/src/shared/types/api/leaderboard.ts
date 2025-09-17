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
