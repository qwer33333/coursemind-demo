"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { Alert } from "@/components/Alert";
import { Metric } from "@/components/Metric";
import { EmptyState } from "@/components/EmptyState";
import { AppHeader } from "@/components/AppHeader";
import {
  getServerStorageSnapshot,
  readQuiz,
  readResult,
  RESULT_STORAGE_KEY,
  subscribeToStorage,
} from "@/lib/storage";

export default function ResultPage() {
  const router = useRouter();
  const quiz = useSyncExternalStore(subscribeToStorage, readQuiz, getServerStorageSnapshot);
  const result = useSyncExternalStore(subscribeToStorage, readResult, getServerStorageSnapshot);

  if (!quiz || !result) {
    return (
      <>
        <AppHeader />
        <EmptyState message="没有找到完整的测验结果，请重新生成并完成测验。" />
      </>
    );
  }

  const answerMap = new Map(result.answers.map((answer) => [answer.questionId, answer]));
  const wrongQuestions = quiz.questions.filter(
    (question) => !answerMap.get(question.id)?.isCorrect,
  );

  function retry() {
    localStorage.removeItem(RESULT_STORAGE_KEY);
    router.push("/quiz");
  }

  return (
    <>
      <AppHeader />
      <PageContainer maxWidth="lg">
        <Card padding="none" className="overflow-hidden">
          {/* Score header */}
          <div className="border-b border-white/10 bg-gradient-to-br from-cyan-400/15 to-indigo-500/10 p-7 sm:p-10">
            <Badge variant="cyan" size="sm" className="mb-3">
              测验已完成
            </Badge>
            <h1 className="text-3xl font-black text-white sm:text-4xl">{quiz.topic}</h1>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Metric label="得分" value={`${result.score} / ${result.total}`} />
              <Metric label="正确率" value={`${result.accuracy}%`} />
              <Metric label="答错题目" value={`${wrongQuestions.length}`} />
            </div>
          </div>

          {/* Detail sections */}
          <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-2">
            {/* Wrong questions */}
            <section>
              <h2 className="text-xl font-bold text-white">错题回顾</h2>
              {wrongQuestions.length ? (
                <ol className="mt-5 space-y-4">
                  {wrongQuestions.map((question, idx) => (
                    <li
                      key={question.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <p className="font-semibold leading-6 text-slate-200">
                        {idx + 1}. {question.question}
                      </p>
                      <p className="mt-2 text-sm text-rose-200">
                        你的答案：{answerMap.get(question.id)?.selectedAnswer || "未作答"}
                      </p>
                      <p className="mt-1 text-sm text-emerald-200">
                        正确答案：{question.answer}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : (
                <Alert variant="success" className="mt-5">
                  全部回答正确。
                </Alert>
              )}
            </section>

            {/* Review suggestions */}
            <section>
              <h2 className="text-xl font-bold text-white">复习建议</h2>
              {result.weakKnowledgePoints.length ? (
                <>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    建议优先复习以下薄弱知识点：
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {result.weakKnowledgePoints.map((point) => (
                      <Badge key={point} variant="indigo">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-5 text-slate-400">本次没有识别到薄弱知识点。</p>
              )}
            </section>
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={retry}>
            重新作答
          </Button>
          <Link href="/">
            <Button variant="primary">生成新题</Button>
          </Link>
        </div>
      </PageContainer>
    </>
  );
}
