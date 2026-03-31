const USERS_KEY = "quizUsers";
const LOGGED_IN_KEY = "quizUsername";

export interface UserAccount {
  username: string;
  password: string;
  createdAt: number;
}

export const getUsername = (): string | null =>
  localStorage.getItem(LOGGED_IN_KEY);
export const setUsername = (u: string) =>
  localStorage.setItem(LOGGED_IN_KEY, u);
export const clearUsername = () => localStorage.removeItem(LOGGED_IN_KEY);
export const isLoggedIn = (): boolean => !!localStorage.getItem(LOGGED_IN_KEY);

function getUsers(): UserAccount[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export type RegisterResult = "ok" | "usernameExists" | "invalidInput";

export function registerUser(
  username: string,
  password: string,
): RegisterResult {
  const trimmed = username.trim();
  if (trimmed.length < 3 || password.length < 4) return "invalidInput";
  const users = getUsers();
  if (users.find((u) => u.username.toLowerCase() === trimmed.toLowerCase()))
    return "usernameExists";
  users.push({ username: trimmed, password, createdAt: Date.now() });
  saveUsers(users);
  return "ok";
}

export function loginUser(username: string, password: string): boolean {
  const trimmed = username.trim();
  const users = getUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === trimmed.toLowerCase(),
  );
  return !!user && user.password === password;
}

export function getAllUsers(): UserAccount[] {
  return getUsers();
}

export function deleteUser(username: string): void {
  const users = getUsers().filter((u) => u.username !== username);
  saveUsers(users);
}
