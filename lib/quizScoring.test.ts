import { describe, expect, it } from "vitest";
import { scoreQuiz } from "./quizScoring";
import type { Quiz } from "./types";

const quiz: Quiz = {
  id: "quiz_1",
  courseCode: "CIE6016",
  courseName: "Advanced Computer Network",
  topic: "TCP",
  questions: [
    {
      id: "q1",
      type: "mcq",
      question: "Q1",
      options: ["A", "B", "C", "D"],
      answer: "A",
      explanation: "E1",
      difficulty: "easy",
      source: "S1",
      knowledgePoints: ["TCP", "cwnd"],
    },
    {
      id: "q2",
      type: "mcq",
      question: "Q2",
      options: ["A", "B", "C", "D"],
      answer: "B",
      explanation: "E2",
      difficulty: "medium",
      source: "S2",
      knowledgePoints: ["cwnd", "慢启动"],
    },
  ],
};

describe("scoreQuiz", () => {
  it("calculates score, accuracy, and unique weak knowledge points", () => {
    const result = scoreQuiz(quiz, [
      { questionId: "q1", selectedAnswer: "A", isCorrect: true },
      { questionId: "q2", selectedAnswer: "C", isCorrect: false },
    ]);
    expect(result.score).toBe(1);
    expect(result.accuracy).toBe(50);
    expect(result.weakKnowledgePoints).toEqual(["cwnd", "慢启动"]);
  });
});
