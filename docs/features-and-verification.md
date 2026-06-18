# CourseMind Demo v2 — 功能与验证文档

## 项目概述

CourseMind Demo 是一个基于 DeepSeek API 的课程资料选择题生成系统。用户输入学习主题，系统根据课程资料上下文自动生成中文选择题，并通过前端界面完成答题、判分和知识点反馈。

**技术栈**: Next.js 16 + React 19 + TypeScript 5.9 + Tailwind CSS 4 + DeepSeek API

---

## 一、设计系统

### 1.1 CSS 变量体系

**文件**: `app/globals.css`

定义 70+ 个 CSS 自定义属性，涵盖颜色刻度、语义 Token、圆角、阴影、过渡。

```css
--color-primary:       var(--cyan-400);    /* 主色 */
--color-success:       var(--emerald-400); /* 成功 */
--color-danger:        var(--rose-400);    /* 危险 */
--color-bg-card:       color-mix(...);     /* 卡片背景 */
--color-bg-input:      color-mix(...);     /* 输入框背景 */
--color-border:        color-mix(...);     /* 边框 */
```

**验收**: 全局替换主色只需修改 `--color-primary` 一行，所有按钮/Badge/聚焦环自动跟随。

### 1.2 统一 CSS 类

| 类名 | 用途 |
|------|------|
| `.btn` `.btn-primary` `.btn-secondary` `.btn-danger` `.btn-ghost` `.btn-sm` `.btn-lg` | 按钮 |
| `.card` `.card-hover` `.card-padded` | 卡片 |
| `.input` `.select` `.label` `.input-error` | 表单 |
| `.badge` `.badge-cyan` `.badge-indigo` `.badge-emerald` `.badge-rose` `.badge-neutral` `.badge-sm` | 标签 |
| `.alert` `.alert-error` `.alert-success` `.alert-info` `.alert-title` | 提示框 |
| `.progress` `.progress-bar` | 进度条 |
| `.skeleton` | 骨架屏加载动画 |
| `.modal-backdrop` `.modal-panel` | 模态框 |

---

## 二、共享组件库

### 2.1 组件清单

| 组件 | 文件 | 核心功能 |
|------|------|---------|
| **Button** | `components/Button.tsx` | 4 种变体 (primary/secondary/danger/ghost) × 3 种尺寸 (sm/md/lg)，支持 loading (自动显示 Spinner) 和 disabled 状态 |
| **Badge** | `components/Badge.tsx` | 5 种颜色 (cyan/indigo/emerald/rose/neutral) × 2 种尺寸 (sm/md) |
| **Card** | `components/Card.tsx` | 3 种 padding (none/md/lg)，支持 hover 边框高亮 |
| **Input / Select / Label** | `components/Input.tsx` | 统一样式，自带 label 和 error 提示 |
| **Alert** | `components/Alert.tsx` | 3 种变体 (error/success/info)，可选 title 和 dismissible 关闭按钮 |
| **ProgressBar** | `components/ProgressBar.tsx` | 渐变色进度条，可选百分比文字 |
| **Modal / ConfirmDialog** | `components/Modal.tsx` | Portal 渲染到 body，点击背景/按 Escape 关闭，滚动锁定；ConfirmDialog 内置确认/取消按钮 |
| **PageContainer** | `components/PageContainer.tsx` | 5 种 max-width (sm/md/lg/xl/full)，统一页边距 |
| **Metric** | `components/Metric.tsx` | 大数字指标卡片 |
| **Spinner** | `components/Spinner.tsx` | SVG 旋转动画，3 种尺寸 |

### 2.2 验收方式

**验证所有组件**: 打开首页、答题页、结果页、资料页，检查：
- 按钮 hover/disabled 状态
- Badge 颜色正确
- Card 卡片有毛玻璃效果
- 输入框聚焦变为青色边框
- Alert 有对应颜色的边框和背景

---

## 三、学习资料管理

### 3.1 页面路由

`/materials` — 新增页面，包含上传表单和资料列表。

### 3.2 API 接口

**文件**: `app/api/materials/route.ts`

| 方法 | 路径 | 功能 | 请求/响应 |
|------|------|------|-----------|
| **GET** | `/api/materials` | 获取全部资料 | Response: `{ materials: Material[] }` |
| **POST** | `/api/materials` | 上传新资料 | Body: `{ title, content }` → Response: `{ material }` (201) |
| **DELETE** | `/api/materials?id=xxx` | 删除资料 | Response: `{ success: true }` / `{ error }` (404) |

数据存储于服务端 `data/materials.json`，不依赖数据库。

### 3.3 状态覆盖

```
Loading  → 骨架屏 (.skeleton shimmer 动画)
Empty    → 📄 图标 + "暂无学习资料" + 上传引导文字
Error    → 红色 Alert + "重试" 按钮
Normal   → 上传表单 + 资料卡片列表
```

### 3.4 删除确认

点击"删除"按钮弹出 ConfirmDialog，显示 `确定要删除「xxx」吗？此操作不可撤销。`

- 点"确认删除" → API DELETE → 列表自动刷新
- 点"取消"或点击背景 → 弹窗关闭，数据不变
- 删除中按钮显示 loading，防止重复点击

### 3.5 验收步骤

```
1. 打开 http://localhost:3000/materials
2. 空列表应显示 📄 暂无学习资料
3. 填标题 "Lecture 5" + 内容，点"上传资料"
4. 右侧列表立即出现新条目，计数 +1
5. 再上传两份，列表增至 3 条
6. 点某条"删除" → 弹出确认框
7. 点"取消" → 弹窗关闭，列表仍为 3 条
8. 再次删除 → 点"确认删除"
9. 列表刷新为 2 条
```

---

## 四、首页资料来源选择

### 4.1 功能

首页新增"学习资料来源"下拉框，实时从 `/api/materials` 获取已上传的资料列表。

- 选择 "Demo 课程资料（默认）" → 使用预置的 `demoCourseContext`
- 选择已上传的资料 → 将该资料的 Markdown 正文作为上下文送给 DeepSeek

### 4.2 API 改动

`app/api/generate-quiz/route.ts` 新增可选 `context` 字段：

```ts
// 前端传了 context 就用它，没传就用 demoCourseContext
const userContext = typeof body.context === "string" && body.context.trim()
  ? body.context.trim()
  : demoCourseContext;
```

### 4.3 验收步骤

```
1. 打开 http://localhost:3000
2. 检查"学习资料来源"下拉框 → 应包含 "Demo 课程资料（默认）"
3. 去 /materials 上传一份资料（标题 "TCP Notes"，内容包含 TCP 知识点）
4. 回首页 → 下拉框已有 "TCP Notes" 选项
5. 选择 "TCP Notes" → 输入主题 "TCP" → 生成测验
6. 题目应基于上传的 TCP Notes 内容生成
```

---

## 五、页面重构

### 5.1 首页 (`/`)

**替换前**: 所有元素用 inline Tailwind 类，form、badge、alert 各自手写。

**替换后**:
- `<PageContainer maxWidth="xl">` 统一页面容器
- `<Card padding="lg">` 表单和侧栏
- `<Badge variant="cyan">` 顶部标签
- `<Input label="学习主题" required />` 表单输入
- `<Select label="题目数量" options={[...]} />` 下拉选择
- `<Select label="学习资料来源" options={[...]} />` 资料选择
- `<Alert variant="error">` 错误提示
- `<Button variant="primary" loading={loading}>` 生成按钮

### 5.2 答题页 (`/quiz`)

**替换后**:
- `<PageContainer maxWidth="md">`
- `<ProgressBar value={index+1} max={total} />` 进度条
- `<Card padding="lg">` 题目卡片
- `<Badge variant="neutral">` 难度标签
- `<Badge variant="cyan">` 知识点标签
- `<Alert variant="success/error" title="回答正确/错误">` 结果反馈
- `<Button variant="primary">` 提交/下一题按钮

### 5.3 结果页 (`/result`)

**替换后**:
- `<PageContainer maxWidth="lg">`
- `<Card padding="none">` 整体容器
- `<Metric label="得分" value={...} />` 指标卡片
- `<Badge variant="indigo">` 薄弱知识点
- `<Alert variant="success">` 全部正确
- `<Button variant="primary/secondary">` 重新作答/新题按钮

### 5.4 导航栏 (`AppHeader`)

新增 "学习资料" 链接指向 `/materials`，DeepSeek 驱动标签改用 `<Badge>`。

### 5.5 验收步骤

```
1. 打开首页 → 确认表单/侧栏并排（桌面）或堆叠（手机）
2. 生成 5 道题 → 自动跳转 /quiz
3. 答题页检查：进度条动画、Badge、选项按钮 4 态
4. 全部答完 → 自动跳转 /result
5. 结果页检查：Metric、错题回顾、薄弱知识点 Badge
6. AppHeader 有 "学习资料" 链接
```

---

## 六、移动端适配

所有页面使用 Tailwind 响应式断点：

| 断点 | 布局变化 |
|------|---------|
| < 640px (手机) | 并排区域堆叠，按钮全宽，Card padding 缩小 |
| 640px+ (平板) | padding 增大 |
| 1024px+ (桌面) | 表单/列表并排，最大宽度增大 |

### 验收步骤

```
1. Chrome DevTools (F12) → 切换设备模拟
2. iPhone 14 (393px): 表格全宽、卡片堆叠、按钮 44px+
3. iPad (768px): padding 增大
4. 桌面 (1280px): 表单/侧栏并排
5. 所有页面在 3 个宽度下均可用
```

---

## 七、自动化测试

### 7.1 单元测试

```bash
npm run test
```

| 测试文件 | 测试内容 |
|---------|---------|
| `lib/quizValidator.test.ts` | JSON 校验：markdown 清理、必填字段、选项数量、答案匹配 |
| `lib/quizScoring.test.ts` | 评分逻辑：正确/错误统计、accuracy 计算、薄弱知识点提取 |
| `app/api/generate-quiz/route.test.ts` | API 路由：校验、生成流程 |

### 7.2 TypeScript

```bash
npx tsc --noEmit
```

零类型错误。

### 7.3 端到端测试

```bash
# 启动
npm run dev

# 测试 API
curl -X POST http://localhost:3000/api/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{"topic":"TCP","questionCount":3}'

# 测试资料 CRUD
curl http://localhost:3000/api/materials
curl -X POST http://localhost:3000/api/materials \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","content":"Test content"}'
curl -X DELETE http://localhost:3000/api/materials?id=xxx
```

---

## 八、文件结构

```
coursemind-demo/
├── app/
│   ├── page.tsx                  # 首页 (生成测验 + 资料选择)
│   ├── layout.tsx                # 根布局
│   ├── globals.css               # 设计系统 (CSS 变量 + 统一类)
│   ├── quiz/page.tsx             # 答题页
│   ├── result/page.tsx           # 结果页
│   ├── materials/page.tsx        # 资料管理 (新增)
│   └── api/
│       ├── generate-quiz/route.ts# 题目生成 API (支持可选 context)
│       └── materials/route.ts    # 资料 CRUD API (新增)
├── components/
│   ├── Alert.tsx                 # 提示框 (新增)
│   ├── AppHeader.tsx             # 导航栏 (已更新)
│   ├── Badge.tsx                 # 标签徽章 (新增)
│   ├── Button.tsx                # 按钮 (新增)
│   ├── Card.tsx                  # 卡片 (新增)
│   ├── EmptyState.tsx            # 空状态
│   ├── Input.tsx                 # 输入框/下拉框/标签 (新增)
│   ├── Metric.tsx                # 指标卡片 (新增, 从 result 页提取)
│   ├── Modal.tsx                 # 模态框 + 确认对话框 (新增)
│   ├── PageContainer.tsx         # 页面容器 (新增)
│   ├── ProgressBar.tsx           # 进度条 (新增)
│   └── Spinner.tsx               # 加载动画 (新增)
├── lib/
│   ├── types.ts                  # 类型定义 (新增 Material)
│   ├── deepseek.ts               # DeepSeek API 封装
│   ├── demoContext.ts            # Demo 课程资料
│   ├── prompt.ts                 # Prompt 模板
│   ├── quizScoring.ts            # 评分逻辑
│   ├── quizValidator.ts          # JSON 校验
│   └── storage.ts                # localStorage 封装
├── data/                         # 运行时数据 (新增)
│   └── materials.json            # 资料存储 (git-ignored)
├── docs/
│   ├── plan.md                   # 产品计划
│   └── features-and-verification.md  # 本文档
└── 配置文件
```

---

## 九、快速开始

```bash
# 1. 安装
npm install

# 2. 配置
cp .env.example .env.local
# 编辑 .env.local 填入 DEEPSEEK_API_KEY

# 3. 运行
npm run dev
# 打开 http://localhost:3000

# 4. 测试
npm run test
```

---

## 十、成员使用指南

1. `git clone https://github.com/qwer33333/coursemind-demo.git`
2. `npm install`
3. 创建 `.env.local` 并填入自己的 DeepSeek API Key
4. `npm run dev`
5. 浏览器打开 `http://localhost:3000`
6. 先去 `/materials` 上传课程 Markdown 资料
7. 回首页选择资料 → 输入主题 → 生成题目 → 答题 → 查看结果
