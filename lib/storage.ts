import type { Quiz, QuizResult } from "./types";

export const QUIZ_STORAGE_KEY = "currentQuiz";
export const RESULT_STORAGE_KEY = "quizResult";

const cache = new Map<string, { raw: string | null; value: unknown }>();

export function readStoredJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    const cached = cache.get(key);
    if (cached?.raw === raw) {
      return cached.value as T | null;
    }
    const value = raw ? (JSON.parse(raw) as T) : null;
    cache.set(key, { raw, value });
    return value;
  } catch {
    return null;
  }
}

export function readQuiz() {
  return readStoredJson<Quiz>(QUIZ_STORAGE_KEY);
}

export function readResult() {
  return readStoredJson<QuizResult>(RESULT_STORAGE_KEY);
}

export function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function getServerStorageSnapshot() {
  return null;
}
