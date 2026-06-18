import type { Quiz, QuizResult, UserAnswer } from "./types";

export function scoreQuiz(quiz: Quiz, answers: UserAnswer[]): QuizResult {
  const score = answers.filter((answer) => answer.isCorrect).length;
  const wrongIds = new Set(answers.filter((answer) => !answer.isCorrect).map((answer) => answer.questionId));
  const weakKnowledgePoints = Array.from(
    new Set(
      quiz.questions
        .filter((question) => wrongIds.has(question.id))
        .flatMap((question) => question.knowledgePoints),
    ),
  );

  return {
    score,
    total: quiz.questions.length,
    accuracy: quiz.questions.length ? Math.round((score / quiz.questions.length) * 100) : 0,
    answers,
    weakKnowledgePoints,
  };
}
