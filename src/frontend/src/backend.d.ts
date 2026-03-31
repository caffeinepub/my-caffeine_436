import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Question {
    id: bigint;
    correctIndex: bigint;
    difficulty: Difficulty;
    questionText: string;
    language: Language;
    category: string;
    options: Array<string>;
}
export interface ScoreEntry {
    id: bigint;
    score: bigint;
    language: Language;
    totalQuestions: bigint;
    timestamp: bigint;
    playerName: string;
    category: string;
}
export interface UserProfile {
    name: string;
}
export interface UserAccount {
    username: string;
    password: string;
    createdAt: bigint;
}
export interface Notice {
    id: bigint;
    title: string;
    content: string;
    isActive: boolean;
    createdAt: bigint;
}
export interface Post {
    id: bigint;
    title: string;
    content: string;
    imageUrl: string;
    createdAt: bigint;
}
export type RegisterResult = { ok: null } | { usernameExists: null } | { invalidInput: null };
export enum Difficulty {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum Language {
    bengali = "bengali",
    english = "english"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addQuestion(question: Question): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteQuestion(id: bigint): Promise<void>;
    getAllQuestions(): Promise<Array<Question>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<ScoreEntry>>;
    getLeaderboardByCategory(category: string): Promise<Array<ScoreEntry>>;
    getQuestionsByCategory(category: string): Promise<Array<Question>>;
    getQuestionsByCategoryAndLanguage(category: string, language: Language): Promise<Array<Question>>;
    getQuestionsByLanguage(language: Language): Promise<Array<Question>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeData(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitScore(entry: ScoreEntry): Promise<ScoreEntry>;
    updateQuestion(id: bigint, question: Question): Promise<void>;
    verifyAdminPassword(password: string): Promise<boolean>;
    // User accounts
    registerUser(username: string, password: string): Promise<RegisterResult>;
    loginUser(username: string, password: string): Promise<boolean>;
    getAllUserAccounts(adminPwd: string): Promise<Array<UserAccount>>;
    // Notices
    getActiveNotices(): Promise<Array<Notice>>;
    getAllNotices(adminPwd: string): Promise<Array<Notice>>;
    addNotice(adminPwd: string, title: string, content: string): Promise<bigint>;
    updateNotice(adminPwd: string, id: bigint, title: string, content: string, isActive: boolean): Promise<void>;
    deleteNotice(adminPwd: string, id: bigint): Promise<void>;
    // Posts
    getActivePosts(): Promise<Array<Post>>;
    getAllPosts(adminPwd: string): Promise<Array<Post>>;
    addPost(adminPwd: string, title: string, content: string, imageUrl: string): Promise<bigint>;
    updatePost(adminPwd: string, id: bigint, title: string, content: string, imageUrl: string): Promise<void>;
    deletePost(adminPwd: string, id: bigint): Promise<void>;
}
