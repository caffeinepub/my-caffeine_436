import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Language, Question, ScoreEntry } from "../backend";
import { getAllUsers } from "../lib/auth";
import {
  addNotice,
  deleteNotice as deleteNoticeLocal,
  getActiveNotices,
  getNotices,
  updateNotice,
} from "../lib/notices";
import {
  addPost,
  deletePost as deletePostLocal,
  getPosts,
  updatePost,
} from "../lib/posts";
import { addScore, getTopScores } from "../lib/scores";
import type { UserAccount } from "../lib/types";
import { useActor } from "./useActor";

export function useGetAllQuestions() {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["allQuestions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetQuestionsByCategoryAndLanguage(
  category: string,
  language: Language,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions", category, language],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuestionsByCategoryAndLanguage(category, language);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

// ── Leaderboard (localStorage) ────────────────────────────────────────────────

export interface LocalScoreEntry {
  id: number;
  playerName: string;
  score: number;
  total: number;
  category: string;
  timestamp: number;
}

export function useGetLeaderboard(category?: string) {
  return useQuery<LocalScoreEntry[]>({
    queryKey: ["leaderboard", category ?? "All"],
    queryFn: () => getTopScores(20, category),
    staleTime: 0,
  });
}

export function useGetLeaderboardByCategory(category: string) {
  return useQuery<LocalScoreEntry[]>({
    queryKey: ["leaderboard", category],
    queryFn: () => getTopScores(20, category),
    staleTime: 0,
  });
}

export function useSubmitLocalScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerName,
      score,
      total,
      category,
    }: {
      playerName: string;
      score: number;
      total: number;
      category: string;
    }) => {
      return addScore(playerName, score, total, category);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

// Keep for backward compat
export function useSubmitScore() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: ScoreEntry) => {
      if (!actor) throw new Error("No actor");
      return actor.submitScore(entry);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (question: Question) => {
      if (!actor) throw new Error("No actor");
      return actor.addQuestion(question);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allQuestions"] });
    },
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      question,
    }: { id: bigint; question: Question }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateQuestion(id, question);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allQuestions"] });
    },
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteQuestion(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allQuestions"] });
    },
  });
}

export function useVerifyAdminPassword() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (password: string) => {
      if (!actor) throw new Error("No actor");
      return actor.verifyAdminPassword(password);
    },
  });
}

// ── Notices (localStorage) ─────────────────────────────────────────────────────

export interface LocalNotice {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: number;
}

export function useGetActiveNotices() {
  return useQuery<LocalNotice[]>({
    queryKey: ["activeNotices"],
    queryFn: () => getActiveNotices(),
    staleTime: 0,
  });
}

export function useGetAllNotices() {
  return useQuery<LocalNotice[]>({
    queryKey: ["allNotices"],
    queryFn: () => getNotices(),
    staleTime: 0,
  });
}

export function useAddNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
    }: { title: string; content: string }) => {
      return addNotice(title, content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allNotices"] });
      qc.invalidateQueries({ queryKey: ["activeNotices"] });
    },
  });
}

export function useUpdateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      isActive,
    }: {
      id: number;
      title: string;
      content: string;
      isActive: boolean;
    }) => {
      updateNotice(id, { title, content, isActive });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allNotices"] });
      qc.invalidateQueries({ queryKey: ["activeNotices"] });
    },
  });
}

export function useDeleteNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      deleteNoticeLocal(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allNotices"] });
      qc.invalidateQueries({ queryKey: ["activeNotices"] });
    },
  });
}

// ── Posts (localStorage) ───────────────────────────────────────────────────────

export interface LocalPost {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: number;
}

export function useGetActivePosts() {
  return useQuery<LocalPost[]>({
    queryKey: ["activePosts"],
    queryFn: () => getPosts(),
    staleTime: 0,
  });
}

export function useGetAllPosts() {
  return useQuery<LocalPost[]>({
    queryKey: ["allPosts"],
    queryFn: () => getPosts(),
    staleTime: 0,
  });
}

export function useAddPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
      imageUrl,
    }: {
      title: string;
      content: string;
      imageUrl: string;
    }) => {
      return addPost(title, content, imageUrl);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPosts"] });
      qc.invalidateQueries({ queryKey: ["activePosts"] });
    },
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      imageUrl,
    }: {
      id: number;
      title: string;
      content: string;
      imageUrl: string;
    }) => {
      updatePost(id, { title, content, imageUrl });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPosts"] });
      qc.invalidateQueries({ queryKey: ["activePosts"] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      deletePostLocal(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPosts"] });
      qc.invalidateQueries({ queryKey: ["activePosts"] });
    },
  });
}

// ── User Accounts (localStorage) ──────────────────────────────────────────────

export function useGetAllUserAccounts() {
  return useQuery<UserAccount[]>({
    queryKey: ["allUserAccounts"],
    queryFn: () => getAllUsers(),
    staleTime: 0,
    refetchInterval: 3000, // auto-refresh every 3s
  });
}
