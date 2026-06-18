import { describe, expect, it } from "vitest";
import { cleanJsonText, parseAndValidateQuizQuestions } from "./quizValidator";

const validQuestion = {
  id: "q_001",
  type: "mcq",
  question: "慢启动期间 cwnd 如何增长？",
  options: ["指数增长", "保持不变", "线性下降", "立即归零"],
  answer: "指数增长",
  explanation: "课程资料指出慢启动期间 cwnd 指数增长。",
  difficulty: "medium",
  source: "Lecture 4 - TCP Congestion Control",
  knowledgePoints: ["慢启动", "cwnd"],
};

describe("quizValidator", () => {
  it("removes markdown fences and validates a question", () => {
    const raw = `\`\`\`json\n${JSON.stringify({ questions: [validQuestion] })}\n\`\`\``;
    expect(cleanJsonText(raw)).toBe(JSON.stringify({ questions: [validQuestion] }));
    expect(parseAndValidateQuizQuestions(raw, 1)).toHaveLength(1);
  });

  it("truncates extra questions", () => {
    const raw = JSON.stringify({ questions: [validQuestion, { ...validQuestion, id: "q_002" }] });
    expect(parseAndValidateQuizQuestions(raw, 1)).toHaveLength(1);
  });

  it("rejects too few questions", () => {
    expect(() => parseAndValidateQuizQuestions(JSON.stringify({ questions: [] }), 1)).toThrow(
      "模型只生成了",
    );
  });

  it("rejects invalid answer and duplicate options", () => {
    expect(() =>
      parseAndValidateQuizQuestions(
        JSON.stringify({ questions: [{ ...validQuestion, answer: "不存在的选项" }] }),
        1,
      ),
    ).toThrow("答案必须与一个选项完全匹配");
    expect(() =>
      parseAndValidateQuizQuestions(
        JSON.stringify({ questions: [{ ...validQuestion, options: ["A", "A", "B", "C"] }] }),
        1,
      ),
    ).toThrow("4 个不同的有效选项");
  });
});
