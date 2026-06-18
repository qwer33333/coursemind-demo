# CourseMind Demo MVP：DeepSeek API 选择题生成与前端渲染

## 1. Demo 目标

本阶段只做一个最小可运行 Demo。

目标是实现：

> 用户选择课程资料主题，系统调用 DeepSeek API 生成选择题，前端将大模型返回的标准 JSON 渲染成可交互的选择题测试界面。

本阶段暂时不做：

```text
1. 小模型
2. RAG
3. PDF 解析
4. 向量数据库
5. 用户上传
6. 社区功能
7. 填空题
8. 登录注册
```

本阶段只做：

```text
1. 预置课程资料内容
2. 用户输入学习主题
3. 调用 DeepSeek API 生成选择题
4. 前端渲染选择题
5. 用户答题
6. 显示正确答案、解析和分数
```

---

## 2. Demo 核心场景

课程：

```text
CIE6016 Advanced Computer Network
```

主题示例：

```text
TCP congestion control
```

用户输入：

```text
I want to study TCP congestion control.
```

系统调用 DeepSeek API，生成 5 道选择题。

前端显示：

```text
Question 1 / 5

Which TCP mechanism increases the congestion window rapidly at the beginning of a connection?

A. Slow start
B. DNS lookup
C. ARP caching
D. Route poisoning

[Submit]
```

提交后显示：

```text
Correct!

Explanation:
Slow start allows TCP to increase the congestion window rapidly during the initial phase of a TCP connection.

Source:
Lecture 4 - TCP Congestion Control
```

---

## 3. 技术栈

建议使用一个 Next.js 全栈项目，方便快速 Demo。

```text
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui
DeepSeek API
```

第一版可以不单独写 FastAPI，直接使用 Next.js API Route 调用 DeepSeek API。

---

## 4. 环境变量

创建 `.env.local`：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

注意：

```text
模型名称必须通过环境变量配置，不要写死在代码里。
如果 DeepSeek 后续调整模型名，只需要改 .env.local。
```

---

## 5. 页面设计

本 Demo 只需要 3 个页面。

---

### Page 1：首页 / 生成题目页面

路径：

```text
/
```

页面内容：

```text
CourseMind Demo

Course:
CIE6016 Advanced Computer Network

Topic:
[ TCP congestion control ]

Question Count:
[ 5 ]

Button:
[ Generate Quiz ]
```

点击按钮后：

```text
1. 调用 /api/generate-quiz
2. 显示 loading 状态
3. 成功后进入 /quiz 页面
```

首页也可以展示一个简化的课程资料上下文：

```text
Demo Source Documents:

1. Lecture 3 - TCP Basics
2. Lecture 4 - TCP Congestion Control
3. Student Notes - Transport Layer
```

---

### Page 2：做题页面

路径：

```text
/quiz
```

功能：

```text
1. 显示当前题目
2. 显示 4 个选项
3. 用户选择答案
4. 点击 Submit
5. 显示是否正确
6. 显示 explanation
7. 点击 Next 进入下一题
```

题目卡片展示字段：

```text
question
options
selected answer
correct answer
explanation
source
knowledge points
```

---

### Page 3：结果页面

路径：

```text
/result
```

展示：

```text
Score: 4 / 5
Accuracy: 80%

Wrong Questions:
- Question 3: TCP fast retransmit
```

同时显示：

```text
Review Suggestions:
You should review:
1. congestion avoidance
2. fast retransmit
3. congestion window
```

---

## 6. 数据结构设计

### MultipleChoiceQuestion

```ts
export type MultipleChoiceQuestion = {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  source: string;
  knowledgePoints: string[];
};
```

---

### Quiz

```ts
export type Quiz = {
  id: string;
  courseCode: string;
  courseName: string;
  topic: string;
  questions: MultipleChoiceQuestion[];
};
```

---

### UserAnswer

```ts
export type UserAnswer = {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
};
```

---

## 7. DeepSeek 生成题目 API

创建 API Route：

```text
POST /api/generate-quiz
```

Request:

```json
{
  "courseCode": "CIE6016",
  "courseName": "Advanced Computer Network",
  "topic": "TCP congestion control",
  "questionCount": 5
}
```

Response:

```json
{
  "quiz": {
    "id": "quiz_001",
    "courseCode": "CIE6016",
    "courseName": "Advanced Computer Network",
    "topic": "TCP congestion control",
    "questions": [
      {
        "id": "q_001",
        "type": "mcq",
        "question": "Which TCP mechanism increases the congestion window rapidly at the beginning of a connection?",
        "options": [
          "Slow start",
          "DNS lookup",
          "ARP caching",
          "Route poisoning"
        ],
        "answer": "Slow start",
        "explanation": "Slow start allows TCP to increase the congestion window rapidly during the initial phase of a TCP connection.",
        "difficulty": "medium",
        "source": "Lecture 4 - TCP Congestion Control",
        "knowledgePoints": [
          "TCP",
          "slow start",
          "congestion window"
        ]
      }
    ]
  }
}
```

---

## 8. 预置课程上下文

Demo 阶段不解析 PDF，直接在代码里写一段 mock context。

创建：

```text
lib/demoContext.ts
```

内容：

```ts
export const demoCourseContext = `
Course: CIE6016 Advanced Computer Network

Topic: TCP Congestion Control

Source 1: Lecture 3 - TCP Basics
TCP is a reliable transport protocol. It provides ordered delivery, retransmission,
flow control, and congestion control. TCP uses acknowledgements to confirm received data.

Source 2: Lecture 4 - TCP Congestion Control
TCP congestion control adjusts the sending rate according to network congestion.
Important mechanisms include slow start, congestion avoidance, fast retransmit,
and fast recovery. The congestion window, also called cwnd, limits the amount of
unacknowledged data that can be sent into the network.

During slow start, TCP increases cwnd exponentially until it reaches a threshold.
During congestion avoidance, TCP increases cwnd more slowly. When packet loss is
detected, TCP reduces cwnd to avoid worsening network congestion.

Source 3: Student Notes - Transport Layer
TCP flow control is mainly related to the receiver window, while congestion control
is related to network conditions. The sender must consider both the receiver window
and the congestion window when deciding how much data to send.
`;
```

---

## 9. DeepSeek Prompt 模板

创建：

```text
lib/prompt.ts
```

Prompt：

```ts
export function buildQuizPrompt(params: {
  courseCode: string;
  courseName: string;
  topic: string;
  questionCount: number;
  context: string;
}) {
  return `
You are a teaching assistant for the course:

Course Code: ${params.courseCode}
Course Name: ${params.courseName}

The student wants to study:

Topic: ${params.topic}

Use the following course context to generate quiz questions:

${params.context}

Task:
Generate exactly ${params.questionCount} multiple-choice questions.

Requirements:
1. Only generate multiple-choice questions.
2. Each question must have exactly 4 options.
3. Only one option should be correct.
4. Questions must be based only on the provided course context.
5. Do not invent concepts that are not in the context.
6. Each question must include:
   - id
   - type
   - question
   - options
   - answer
   - explanation
   - difficulty
   - source
   - knowledgePoints
7. The "type" field must always be "mcq".
8. The "answer" must exactly match one of the options.
9. Output valid JSON only.
10. Do not include markdown.
11. Do not include explanations outside JSON.

Expected JSON format:

{
  "questions": [
    {
      "id": "q_001",
      "type": "mcq",
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "answer": "...",
      "explanation": "...",
      "difficulty": "medium",
      "source": "...",
      "knowledgePoints": ["..."]
    }
  ]
}
`;
}
```

---

## 10. JSON 校验规则

DeepSeek 返回后，后端必须检查：

```text
1. 是否能 parse 成 JSON
2. 是否存在 questions 数组
3. questions.length 是否等于 questionCount
4. 每道题 type 是否等于 mcq
5. 每道题 options 是否正好有 4 个
6. answer 是否存在于 options 中
7. explanation 是否存在
8. source 是否存在
9. knowledgePoints 是否是数组
```

如果校验失败：

```text
返回错误信息给前端，不要让前端直接崩溃。
```

Demo 阶段可以做简单自动修复：

````text
1. 如果返回 markdown code block，去掉 ```json 和 ```
2. 如果 questions 多于 questionCount，截取前 N 个
3. 如果 questions 少于 questionCount，直接报错
````

---

## 11. 前端状态管理

Demo 阶段可以使用 localStorage 保存 quiz。

流程：

```text
首页点击 Generate Quiz
    ↓
调用 /api/generate-quiz
    ↓
成功后 localStorage.setItem("currentQuiz", JSON.stringify(quiz))
    ↓
router.push("/quiz")
```

做题页面：

```text
读取 localStorage.currentQuiz
    ↓
逐题展示
    ↓
记录用户选择
    ↓
全部完成后 localStorage.setItem("quizResult", JSON.stringify(result))
    ↓
router.push("/result")
```

---

## 12. 文件结构建议

```text
coursemind-demo/
  app/
    page.tsx
    quiz/
      page.tsx
    result/
      page.tsx
    api/
      generate-quiz/
        route.ts

  components/
    CourseHeader.tsx
    GenerateQuizForm.tsx
    QuizCard.tsx
    QuizProgress.tsx
    ResultSummary.tsx

  lib/
    types.ts
    demoContext.ts
    prompt.ts
    deepseek.ts
    quizValidator.ts
    quizScoring.ts

  .env.local
  package.json
```

---

## 13. lib/types.ts

```ts
export type MultipleChoiceQuestion = {
  id: string;
  type: "mcq";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
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
```

---

## 14. lib/deepseek.ts

```ts
export async function callDeepSeek(prompt: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL;
  const model = process.env.DEEPSEEK_MODEL;

  if (!apiKey) {
    throw new Error("Missing DEEPSEEK_API_KEY");
  }

  if (!baseUrl) {
    throw new Error("Missing DEEPSEEK_BASE_URL");
  }

  if (!model) {
    throw new Error("Missing DEEPSEEK_MODEL");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a strict JSON generator. Always output valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}
```

---

## 15. lib/quizValidator.ts

````ts
import { MultipleChoiceQuestion } from "./types";

function cleanJsonText(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export function parseAndValidateQuizQuestions(rawText: string, expectedCount: number) {
  const cleaned = cleanJsonText(rawText);

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Model output is not valid JSON.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("questions" in parsed) ||
    !Array.isArray((parsed as any).questions)
  ) {
    throw new Error("Model output must contain a questions array.");
  }

  const questions = (parsed as any).questions;

  if (questions.length < expectedCount) {
    throw new Error(`Expected ${expectedCount} questions, but got ${questions.length}.`);
  }

  const sliced = questions.slice(0, expectedCount);

  const validated: MultipleChoiceQuestion[] = sliced.map((q: any, index: number) => {
    if (q.type !== "mcq") {
      throw new Error(`Question ${index + 1} is not mcq.`);
    }

    if (typeof q.question !== "string" || q.question.length === 0) {
      throw new Error(`Question ${index + 1} has invalid question text.`);
    }

    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${index + 1} must have exactly 4 options.`);
    }

    if (typeof q.answer !== "string" || !q.options.includes(q.answer)) {
      throw new Error(`Question ${index + 1} answer must match one of the options.`);
    }

    if (typeof q.explanation !== "string" || q.explanation.length === 0) {
      throw new Error(`Question ${index + 1} must have explanation.`);
    }

    return {
      id: q.id || `q_${String(index + 1).padStart(3, "0")}`,
      type: "mcq",
      question: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      difficulty: q.difficulty || "medium",
      source: q.source || "Demo Course Context",
      knowledgePoints: Array.isArray(q.knowledgePoints) ? q.knowledgePoints : []
    };
  });

  return validated;
}
````

---

## 16. app/api/generate-quiz/route.ts

```ts
import { NextResponse } from "next/server";
import { demoCourseContext } from "@/lib/demoContext";
import { buildQuizPrompt } from "@/lib/prompt";
import { callDeepSeek } from "@/lib/deepseek";
import { parseAndValidateQuizQuestions } from "@/lib/quizValidator";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const courseCode = body.courseCode || "CIE6016";
    const courseName = body.courseName || "Advanced Computer Network";
    const topic = body.topic || "TCP congestion control";
    const questionCount = Number(body.questionCount || 5);

    if (questionCount < 1 || questionCount > 10) {
      return NextResponse.json(
        { error: "questionCount must be between 1 and 10." },
        { status: 400 }
      );
    }

    const prompt = buildQuizPrompt({
      courseCode,
      courseName,
      topic,
      questionCount,
      context: demoCourseContext
    });

    const rawOutput = await callDeepSeek(prompt);

    if (!rawOutput) {
      throw new Error("Empty response from DeepSeek API.");
    }

    const questions = parseAndValidateQuizQuestions(rawOutput, questionCount);

    return NextResponse.json({
      quiz: {
        id: `quiz_${Date.now()}`,
        courseCode,
        courseName,
        topic,
        questions
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Failed to generate quiz."
      },
      { status: 500 }
    );
  }
}
```

---

## 17. 首页功能要求

首页需要实现：

```text
1. 显示项目名 CourseMind Demo
2. 显示课程 CIE6016 Advanced Computer Network
3. 输入 topic
4. 选择 questionCount，默认 5
5. 点击 Generate Quiz
6. 显示 loading
7. 调用 /api/generate-quiz
8. 成功后把 quiz 存到 localStorage
9. 跳转 /quiz
10. 失败时显示错误信息
```

---

## 18. Quiz 页面功能要求

Quiz 页面需要实现：

```text
1. 从 localStorage 读取 currentQuiz
2. 如果没有 quiz，返回首页
3. 一次显示一道题
4. 用户选择一个 option
5. 点击 Submit
6. 判断 selectedOption === answer
7. 显示 Correct / Incorrect
8. 显示 explanation
9. 显示 source
10. 点击 Next
11. 最后一题点击 Finish
12. 生成 quizResult 并存入 localStorage
13. 跳转 /result
```

---

## 19. Result 页面功能要求

Result 页面需要实现：

```text
1. 从 localStorage 读取 currentQuiz 和 quizResult
2. 显示分数
3. 显示正确率
4. 显示错题列表
5. 显示薄弱知识点
6. 提供按钮：
   - Try Again
   - Generate New Quiz
```

薄弱知识点计算方式：

```text
收集所有答错题目的 knowledgePoints，去重后展示。
```

---

## 20. UI 风格要求

整体风格：

```text
现代、干净、适合 AI Demo 展示
```

建议页面组件：

```text
Card
Button
Input
Badge
Progress
Radio Group
Alert
```

首页需要突出：

```text
AI-generated quiz from course materials
```

Quiz 页面需要突出：

```text
Generated by DeepSeek API
```

---

## 21. Demo 验收标准

完成后必须能跑通以下流程：

```text
1. 打开首页
2. 输入 TCP congestion control
3. 点击 Generate Quiz
4. 后端调用 DeepSeek API
5. DeepSeek 返回选择题 JSON
6. 前端进入 Quiz 页面
7. 用户可以逐题选择答案
8. 提交后显示是否正确
9. 显示 explanation 和 source
10. 完成后进入 Result 页面
11. 显示分数、正确率和薄弱知识点
```

---

## 22. 当前 Demo 的边界

当前版本只证明一件事：

```text
DeepSeek API 可以根据课程资料上下文生成结构化选择题，
并且前端可以稳定渲染和测试这些题目。
```

当前版本不证明：

```text
1. 真实 PDF 解析能力
2. 小模型推荐能力
3. 向量检索能力
4. 多用户社区能力
5. 完整 RAG 能力
```

这些留给后续本科生继续完善。

---

## 23. 后续本科生扩展方向

### 阶段 2：加入 PDF 上传

```text
1. 上传 PDF
2. 抽取文本
3. 替换 demoCourseContext
```

### 阶段 3：加入 RAG

```text
1. PDF chunking
2. embedding
3. vector search
4. 根据 topic 选出相关 chunks
5. 把 chunks 放入 prompt
```

### 阶段 4：加入小模型

```text
1. 本地小模型做标签提取
2. 本地小模型做资料推荐
3. 本地小模型做题目质量检查
```

### 阶段 5：加入 UGC 社区

```text
1. 用户上传资料
2. 课程资料池
3. 点赞收藏
4. 资料评分
5. 社区贡献记录
```

---

## 24. 一句话介绍 Demo

```text
CourseMind Demo 是一个基于 DeepSeek API 的课程资料选择题生成系统，
它可以根据预置课程资料上下文自动生成选择题，
并通过前端界面完成答题、判分和知识点反馈。
```
