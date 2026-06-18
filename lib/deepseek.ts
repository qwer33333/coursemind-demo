type DeepSeekResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

export async function callDeepSeek(prompt: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL;
  const model = process.env.DEEPSEEK_MODEL;

  if (!apiKey || !baseUrl || !model) {
    throw new Error("DeepSeek API 配置不完整。");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "你是严格的 JSON 生成器，只输出有效 JSON。",
          },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API 请求失败（HTTP ${response.status}）。`);
    }

    const data = (await response.json()) as DeepSeekResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("DeepSeek API 返回了空内容。");
    }
    return content;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("DeepSeek API 请求超时。");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
