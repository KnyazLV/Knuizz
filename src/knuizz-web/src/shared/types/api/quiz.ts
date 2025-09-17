export interface QuizSummary {
  id: string;
  title: string;
  description: string;
  authorName: string;
  questionCount: number;
  createdAt: string;
  isPublished: boolean;
}

export interface QuestionDto {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  isPublished?: boolean;
  questions: QuestionDto[];
}

export interface QuizDetails extends CreateQuizRequest {
  id: string;
  authorId: string;
  createdAt: string;
}

export interface UpdateQuizRequest {
  id: string;
  data: CreateQuizRequest;
}
