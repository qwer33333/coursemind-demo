# CourseMind Demo

CourseMind 是一个基于 DeepSeek API 的课程资料选择题生成 Demo。用户可以根据预置的
CIE6016 课程资料生成中文选择题、逐题作答，并查看分数和薄弱知识点。

## 本地运行

```bash
npm install
cp .env.example .env.local
npm run dev
```

在 `.env.local` 中填写真实的 `DEEPSEEK_API_KEY`，并按需修改模型名称：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

在 `web_py312` 环境中启动并打开 `http://localhost:3000`：

```bash
conda activate web_py312
npm run dev
```

## 命令

```bash
npm run dev
npm run test
npm run lint
npm run build
```

详细产品计划见 [docs/plan.md](docs/plan.md)。
