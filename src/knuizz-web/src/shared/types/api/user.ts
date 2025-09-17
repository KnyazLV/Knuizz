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
