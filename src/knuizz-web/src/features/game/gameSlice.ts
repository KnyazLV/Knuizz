import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Question } from "@/shared/types/api";

interface GameState {
  gameId: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  gameStatus: "idle" | "playing" | "finished";
  timePerQuestion: number;
  sourceName: string | null;
  userQuizId: string | null;
}

const initialState: GameState = {
  gameId: null,
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  gameStatus: "idle",
  timePerQuestion: 30,
  sourceName: null,
  userQuizId: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    // Action to start a new game
    startGame: (
      state,
      action: PayloadAction<{
        questions: Question[];
        sourceName: string;
        userQuizId?: string | null;
        timePerQuestion?: number;
      }>,
    ) => {
      state.gameId = `game-${Date.now()}`;
      state.questions = action.payload.questions;
      state.gameStatus = "playing";
      state.currentQuestionIndex = 0;
      state.score = 0;
      state.sourceName = action.payload.sourceName;
      state.userQuizId = action.payload.userQuizId || null;
      state.timePerQuestion = action.payload.timePerQuestion || 15;
    },
    // Action to handle a user's answer
    answerQuestion: (state, action: PayloadAction<{ answerIndex: number }>) => {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      if (currentQuestion.correctAnswerIndex === action.payload.answerIndex) {
        state.score += 1;
      }
      // Move to the next question or finish the game
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      } else {
        state.gameStatus = "finished";
      }
    },
    // Action to end the game prematurely (e.g., timer runs out)
    endGame: (state) => {
      state.gameStatus = "finished";
    },
    // Action to reset the game state
    resetGame: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const { startGame, answerQuestion, endGame, resetGame } =
  gameSlice.actions;
export default gameSlice.reducer;
