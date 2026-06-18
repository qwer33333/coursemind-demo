"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Alert } from "@/components/Alert";
import { ConfirmDialog } from "@/components/Modal";
import { Input, Label } from "@/components/Input";
import { AppHeader } from "@/components/AppHeader";
import type { Material } from "@/lib/types";

function SkeletonRow() {
  return (
    <div className="rounded-xl border border-white/5 p-5 space-y-3">
      <div className="skeleton h-5 w-2/3" />
      <div className="skeleton h-3 w-1/4" />
      <div className="skeleton h-4 w-full" />
    </div>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* Upload form */
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  /* Delete confirm */
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/materials");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加载资料失败");
      setMaterials(data.materials as Material[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "加载资料失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setUploadError("标题和内容不能为空。");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "上传失败");
      setTitle("");
      setContent("");
      await fetchMaterials();
    } catch (caught) {
      setUploadError(caught instanceof Error ? caught.message : "上传失败，请稍后重试。");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/materials?id=${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "删除失败");
      setDeleteTarget(null);
      await fetchMaterials();
    } catch (caught) {
      setUploadError(caught instanceof Error ? caught.message : "删除失败。");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AppHeader />
      <PageContainer maxWidth="xl">
        <section className="mb-10">
          <span className="section-label inline-block text-indigo-300 mb-3">课程资料管理</span>
          <h1 className="text-3xl font-black text-white sm:text-4xl">学习资料</h1>
          <p className="mt-3 text-slate-400 max-w-xl">
            上传 Markdown 格式的课程笔记或讲义，作为生成测验的资料上下文。
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          {/* ---- Upload Form ---- */}
          <Card padding="lg">
            <h2 className="text-lg font-bold text-white mb-5">上传新资料</h2>
            <form onSubmit={handleUpload}>
              <Input
                label="资料标题"
                placeholder="例如：Lecture 5 Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                required
              />
              <Label required>资料内容（Markdown）</Label>
              <textarea
                className="input min-h-[200px] mb-5"
                placeholder="输入或粘贴 Markdown 内容..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={uploading}
              />
              {uploadError && (
                <Alert variant="error" className="mb-5">
                  {uploadError}
                </Alert>
              )}
              <Button type="submit" variant="primary" loading={uploading} className="w-full">
                上传资料
              </Button>
            </form>
          </Card>

          {/* ---- Materials List ---- */}
          <div>
            <h2 className="text-lg font-bold text-white mb-5">
              已上传资料
              {!loading && materials.length > 0 && (
                <Badge variant="neutral" size="sm" className="ml-2">
                  {materials.length}
                </Badge>
              )}
            </h2>

            {/* Loading */}
            {loading && (
              <div className="grid gap-3">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <Card>
                <Alert variant="error">{error}</Alert>
                <Button variant="secondary" size="sm" className="mt-4" onClick={fetchMaterials}>
                  重试
                </Button>
              </Card>
            )}

            {/* Empty */}
            {!loading && !error && materials.length === 0 && (
              <Card>
                <div className="text-center py-10">
                  <div className="text-5xl mb-4 opacity-30">📄</div>
                  <p className="text-slate-400 mb-2">暂无学习资料</p>
                  <p className="text-sm text-slate-500">上传 Markdown 资料后，可在此管理和选择用于生成测验</p>
                </div>
              </Card>
            )}

            {/* List */}
            {!loading && !error && materials.length > 0 && (
              <div className="grid gap-3">
                {materials.map((mat) => (
                  <Card key={mat.id} hover padding="md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white truncate">{mat.title}</h3>
                        <Badge variant="neutral" size="sm" className="mt-1">
                          {formatDate(mat.createdAt)}
                        </Badge>
                        <p className="mt-2 text-sm text-slate-400 truncate-lines-2">
                          {mat.content.slice(0, 150)}
                          {mat.content.length > 150 ? "…" : ""}
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteTarget(mat)}
                        className="shrink-0"
                      >
                        删除
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ---- Delete Confirm ---- */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="确认删除"
          message={`确定要删除「${deleteTarget?.title}」吗？此操作不可撤销。`}
          loading={deleting}
          variant="danger"
        />
      </PageContainer>
    </>
  );
}
