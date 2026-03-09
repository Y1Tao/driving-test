export type QuestionType = 'single' | 'multiple' | 'judgment' | 'case';

export interface Question {
  id: string;
  index: number;
  type: QuestionType;
  content: string;
  options?: string[]; // For single/multiple choice
  answer: string | string[]; // 'A', ['A', 'B'], or 'T'/'F' (True/False)
  explanation?: string; // Optional explanation if available
  userAnswer?: string | string[]; // For tracking user input
  isCorrect?: boolean; // Whether the user answered correctly
  source?: 'public' | 'professional';
  category?: string; // e.g. "第一部分 法律法规、规章制度和标准规范"
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  showAnswer: boolean;
  examMode: boolean;
  timeLeft: number; // In seconds
  wrongQuestions: string[]; // List of question IDs
}
