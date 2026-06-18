import type { Difficulty, MultipleChoiceQuestion } from "./types";

export function cleanJsonText(text: string) {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

export function parseAndValidateQuizQuestions(rawText: string, expectedCount: number) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleanJsonText(rawText));
  } catch {
    throw new Error("模型输出不是有效的 JSON。");
  }

  if (!parsed || typeof parsed !== "object" || !("questions" in parsed)) {
    throw new Error("模型输出缺少 questions 数组。");
  }

  const questions = (parsed as { questions: unknown }).questions;
  if (!Array.isArray(questions)) {
    throw new Error("模型输出中的 questions 必须是数组。");
  }
  if (questions.length < expectedCount) {
    throw new Error(`模型只生成了 ${questions.length} 道题，需要 ${expectedCount} 道。`);
  }

  return questions.slice(0, expectedCount).map((value, index) => {
    const number = index + 1;
    if (!value || typeof value !== "object") {
      throw new Error(`第 ${number} 道题格式无效。`);
    }
    const question = value as Record<string, unknown>;
    if (question.type !== "mcq" || !isNonEmptyString(question.question)) {
      throw new Error(`第 ${number} 道题的类型或题干无效。`);
    }
    if (
      !Array.isArray(question.options) ||
      question.options.length !== 4 ||
      !question.options.every(isNonEmptyString) ||
      new Set(question.options).size !== 4
    ) {
      throw new Error(`第 ${number} 道题必须包含 4 个不同的有效选项。`);
    }
    if (!isNonEmptyString(question.answer) || !question.options.includes(question.answer)) {
      throw new Error(`第 ${number} 道题的答案必须与一个选项完全匹配。`);
    }
    if (!isNonEmptyString(question.explanation) || !isNonEmptyString(question.source)) {
      throw new Error(`第 ${number} 道题缺少解析或来源。`);
    }
    if (
      !Array.isArray(question.knowledgePoints) ||
      !question.knowledgePoints.every(isNonEmptyString)
    ) {
      throw new Error(`第 ${number} 道题的知识点格式无效。`);
    }

    return {
      id: isNonEmptyString(question.id) ? question.id : `q_${String(number).padStart(3, "0")}`,
      type: "mcq",
      question: question.question,
      options: question.options,
      answer: question.answer,
      explanation: question.explanation,
      difficulty: isDifficulty(question.difficulty) ? question.difficulty : "medium",
      source: question.source,
      knowledgePoints: question.knowledgePoints,
    } satisfies MultipleChoiceQuestion;
  });
}
