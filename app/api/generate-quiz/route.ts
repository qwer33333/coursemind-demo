import { NextResponse } from "next/server";
import { callDeepSeek } from "@/lib/deepseek";
import { demoCourseContext } from "@/lib/demoContext";
import { buildQuizPrompt } from "@/lib/prompt";
import { parseAndValidateQuizQuestions } from "@/lib/quizValidator";

type GenerateQuizRequest = {
  courseCode?: unknown;
  courseName?: unknown;
  topic?: unknown;
  questionCount?: unknown;
  context?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateQuizRequest;
    const courseCode = typeof body.courseCode === "string" ? body.courseCode.trim() : "CIE6016";
    const courseName =
      typeof body.courseName === "string" ? body.courseName.trim() : "Advanced Computer Network";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const questionCount = Number(body.questionCount);
    const userContext = typeof body.context === "string" && body.context.trim()
      ? body.context.trim()
      : demoCourseContext;

    if (!courseCode || !courseName || !topic) {
      return NextResponse.json({ error: "课程信息和学习主题不能为空。" }, { status: 400 });
    }
    if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 10) {
      return NextResponse.json({ error: "题目数量必须是 1 到 10 之间的整数。" }, { status: 400 });
    }

    const prompt = buildQuizPrompt({
      courseCode,
      courseName,
      topic,
      questionCount,
      context: userContext,
    });
    const rawOutput = await callDeepSeek(prompt);
    const questions = parseAndValidateQuizQuestions(rawOutput, questionCount);

    return NextResponse.json({
      quiz: {
        id: `quiz_${Date.now()}`,
        courseCode,
        courseName,
        topic,
        questions,
      },
    });
  } catch (error) {
    console.error("Failed to generate quiz:", error);
    const message =
      error instanceof Error && error.message.startsWith("DeepSeek API 配置")
        ? error.message
        : "题目生成失败，请检查 DeepSeek API 配置后重试。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
