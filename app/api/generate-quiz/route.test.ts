import { beforeEach, describe, expect, it, vi } from "vitest";
import { callDeepSeek } from "@/lib/deepseek";
import { POST } from "./route";

vi.mock("@/lib/deepseek", () => ({
  callDeepSeek: vi.fn(),
}));

const validModelOutput = JSON.stringify({
  questions: [
    {
      id: "q_001",
      type: "mcq",
      question: "慢启动期间 cwnd 如何增长？",
      options: ["指数增长", "保持不变", "线性下降", "立即归零"],
      answer: "指数增长",
      explanation: "慢启动期间 cwnd 指数增长。",
      difficulty: "medium",
      source: "Lecture 4 - TCP Congestion Control",
      knowledgePoints: ["慢启动", "cwnd"],
    },
  ],
});

describe("POST /api/generate-quiz", () => {
  beforeEach(() => {
    vi.mocked(callDeepSeek).mockReset();
  });

  it("rejects an empty topic", async () => {
    const request = new Request("http://localhost/api/generate-quiz", {
      method: "POST",
      body: JSON.stringify({ topic: "", questionCount: 5 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "课程信息和学习主题不能为空。" });
  });

  it("rejects an invalid question count", async () => {
    const request = new Request("http://localhost/api/generate-quiz", {
      method: "POST",
      body: JSON.stringify({ topic: "TCP", questionCount: 11 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns a validated quiz for a valid request", async () => {
    vi.mocked(callDeepSeek).mockResolvedValue(validModelOutput);
    const request = new Request("http://localhost/api/generate-quiz", {
      method: "POST",
      body: JSON.stringify({ topic: "TCP", questionCount: 1 }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.quiz.topic).toBe("TCP");
    expect(data.quiz.questions).toHaveLength(1);
  });

  it("does not expose upstream error details", async () => {
    vi.mocked(callDeepSeek).mockRejectedValue(new Error("secret upstream response"));
    const request = new Request("http://localhost/api/generate-quiz", {
      method: "POST",
      body: JSON.stringify({ topic: "TCP", questionCount: 1 }),
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.error).not.toContain("secret upstream response");
  });
});
