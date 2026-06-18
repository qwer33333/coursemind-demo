export function buildQuizPrompt(params: {
  courseCode: string;
  courseName: string;
  topic: string;
  questionCount: number;
  context: string;
}) {
  return `
你是课程 ${params.courseCode} ${params.courseName} 的助教。
学生希望学习的主题是：${params.topic}

请仅使用以下课程资料生成题目：
${params.context}

生成恰好 ${params.questionCount} 道中文单项选择题。

要求：
1. 每道题必须有且仅有 4 个选项，且仅有一个正确答案。
2. 题目只能基于给定课程资料，不得编造资料中没有的概念。
3. answer 必须与 options 中的某一项完全一致。
4. type 必须为 "mcq"。
5. difficulty 必须为 "easy"、"medium" 或 "hard"。
6. explanation、source 和 knowledgePoints 必须完整。
7. 仅输出有效 JSON，不得输出 Markdown 或 JSON 之外的解释。

JSON 格式：
{
  "questions": [
    {
      "id": "q_001",
      "type": "mcq",
      "question": "中文题目",
      "options": ["选项一", "选项二", "选项三", "选项四"],
      "answer": "选项一",
      "explanation": "中文解析",
      "difficulty": "medium",
      "source": "资料名称",
      "knowledgePoints": ["知识点"]
    }
  ]
}
`;
}
