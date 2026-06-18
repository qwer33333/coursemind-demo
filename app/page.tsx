"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Alert } from "@/components/Alert";
import { Input, Select } from "@/components/Input";
import { AppHeader } from "@/components/AppHeader";
import { demoSources } from "@/lib/demoContext";
import { QUIZ_STORAGE_KEY, RESULT_STORAGE_KEY } from "@/lib/storage";
import type { Material, Quiz } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState("TCP congestion control");
  const [questionCount, setQuestionCount] = useState(5);
  const [materialId, setMaterialId] = useState("demo");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/materials")
      .then((r) => r.json())
      .then((d) => setMaterials(d.materials || []))
      .catch(() => {})
      .finally(() => setMaterialsLoading(false));
  }, []);

  useEffect(() => {
    if (materialId === "demo") {
      setSelectedContent("");
    } else {
      const mat = materials.find((m) => m.id === materialId);
      setSelectedContent(mat?.content || "");
    }
  }, [materialId, materials]);

  const countOptions = [
    { value: 3, label: "3 道题" },
    { value: 5, label: "5 道题" },
    { value: 7, label: "7 道题" },
    { value: 10, label: "10 道题" },
  ];

  const materialOptions = [
    { value: "demo", label: "Demo 课程资料（默认）" },
    ...materials.map((m) => ({ value: m.id, label: m.title })),
  ];

  async function generateQuiz(event: FormEvent) {
    event.preventDefault();
    const cleanedTopic = topic.trim();
    if (!cleanedTopic) {
      setError("请输入学习主题。");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        courseCode: "CIE6016",
        courseName: "Advanced Computer Network",
        topic: cleanedTopic,
        questionCount,
      };
      if (selectedContent) {
        body.context = selectedContent;
      }
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { quiz?: Quiz; error?: string };
      if (!response.ok || !data.quiz) {
        throw new Error(data.error || "题目生成失败。");
      }
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(data.quiz));
      localStorage.removeItem(RESULT_STORAGE_KEY);
      router.push("/quiz");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "题目生成失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader />
      <PageContainer maxWidth="xl">
        {/* Hero */}
        <section className="mb-12 max-w-3xl">
          <Badge variant="cyan" className="mb-5">
            从课程资料生成 AI 测验
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
            用选择题检验你对
            <span className="block bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              课程知识的掌握程度
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            输入学习主题，CourseMind 将根据课程资料调用 DeepSeek 生成一组中文选择题。
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Form */}
          <Card padding="lg">
            <div className="mb-7">
              <p className="section-label text-cyan-300 mb-2">当前课程</p>
              <h2 className="text-2xl font-bold text-white">CIE6016 Advanced Computer Network</h2>
            </div>

            <form onSubmit={generateQuiz}>
              <Select
                label="学习资料来源"
                options={materialOptions}
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                disabled={loading || materialsLoading}
              />

              <Input
                label="学习主题"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
                placeholder="例如：TCP congestion control"
                required
              />

              <Select
                label="题目数量"
                options={countOptions}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                disabled={loading}
              />

              {error && (
                <Alert variant="error" className="mb-5">
                  {error}
                </Alert>
              )}

              <Button type="submit" variant="primary" loading={loading} className="w-full">
                生成测验
              </Button>
            </form>
          </Card>

          {/* Source sidebar */}
          <Card padding="lg">
            <p className="section-label text-indigo-300 mb-2">Demo 资料来源</p>
            <h2 className="text-xl font-bold text-white mb-6">预置课程材料</h2>
            <ol className="space-y-4">
              {demoSources.map((source, index) => (
                <li key={source} className="flex gap-3 text-sm leading-6 text-slate-300">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/5 text-xs font-bold text-cyan-200">
                    {index + 1}
                  </span>
                  {source}
                </li>
              ))}
            </ol>
            {!materialsLoading && materials.length > 0 && (
              <div className="mt-6 pt-5 border-t border-white/10">
                <p className="text-xs text-slate-400">
                  另有 {materials.length} 份已上传资料可选
                </p>
              </div>
            )}
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
