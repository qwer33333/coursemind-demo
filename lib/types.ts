export type Difficulty = "easy" | "medium" | "hard";

export type MultipleChoiceQuestion = {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: Difficulty;
  source: string;
  knowledgePoints: string[];
};

export type Quiz = {
  id: string;
  courseCode: string;
  courseName: string;
  topic: string;
  questions: MultipleChoiceQuestion[];
};

export type UserAnswer = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
};

export type QuizResult = {
  score: number;
  total: number;
  accuracy: number;
  answers: UserAnswer[];
  weakKnowledgePoints: string[];
};

export type Material = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};
