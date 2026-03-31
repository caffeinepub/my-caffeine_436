import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Language, Question, ScoreEntry } from "../backend";
import { getAllUsers } from "../lib/auth";
import type { Notice, Post, UserAccount } from "../lib/types";
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

export function useGetLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<ScoreEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetLeaderboardByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ScoreEntry[]>({
    queryKey: ["leaderboard", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "All") return actor.getLeaderboard();
      return actor.getLeaderboardByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

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

// ── Notices ────────────────────────────────────────────────────────────────────────────

export function useGetActiveNotices() {
  const { actor, isFetching } = useActor();
  return useQuery<Notice[]>({
    queryKey: ["activeNotices"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getActiveNotices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllNotices() {
  const { actor, isFetching } = useActor();
  return useQuery<Notice[]>({
    queryKey: ["allNotices"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllNotices("admin123");
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddNotice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      content,
    }: { title: string; content: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).addNotice("admin123", title, content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allNotices"] });
      qc.invalidateQueries({ queryKey: ["activeNotices"] });
    },
  });
}

export function useUpdateNotice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      isActive,
    }: {
      id: bigint;
      title: string;
      content: string;
      isActive: boolean;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).updateNotice(
        "admin123",
        id,
        title,
        content,
        isActive,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allNotices"] });
      qc.invalidateQueries({ queryKey: ["activeNotices"] });
    },
  });
}

export function useDeleteNotice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deleteNotice("admin123", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allNotices"] });
      qc.invalidateQueries({ queryKey: ["activeNotices"] });
    },
  });
}

// ── Posts ───────────────────────────────────────────────────────────────────────────────

export function useGetActivePosts() {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["activePosts"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getActivePosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllPosts() {
  const { actor, isFetching } = useActor();
  return useQuery<Post[]>({
    queryKey: ["allPosts"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllPosts("admin123");
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPost() {
  const { actor } = useActor();
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
      if (!actor) throw new Error("No actor");
      return (actor as any).addPost("admin123", title, content, imageUrl);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPosts"] });
      qc.invalidateQueries({ queryKey: ["activePosts"] });
    },
  });
}

export function useUpdatePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      title,
      content,
      imageUrl,
    }: {
      id: bigint;
      title: string;
      content: string;
      imageUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).updatePost(
        "admin123",
        id,
        title,
        content,
        imageUrl,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPosts"] });
      qc.invalidateQueries({ queryKey: ["activePosts"] });
    },
  });
}

export function useDeletePost() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).deletePost("admin123", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allPosts"] });
      qc.invalidateQueries({ queryKey: ["activePosts"] });
    },
  });
}

// ── User Accounts (localStorage-based) ─────────────────────────────────────────────

export function useGetAllUserAccounts() {
  return useQuery<UserAccount[]>({
    queryKey: ["allUserAccounts"],
    queryFn: () => getAllUsers(),
    staleTime: 0,
  });
}
