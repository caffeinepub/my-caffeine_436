const USERS_KEY = "quizUsers";
const LOGGED_IN_KEY = "quizUsername";

export interface UserAccount {
  email: string; // primary identifier (email or phone)
  phone: string; // optional extra phone
  name: string; // display name
  bkash: string; // bKash number
  password: string;
  createdAt: number;
  photo?: string; // base64 data URL
}

export const getUsername = (): string | null =>
  localStorage.getItem(LOGGED_IN_KEY);
export const setUsername = (u: string) =>
  localStorage.setItem(LOGGED_IN_KEY, u);
export const clearUsername = () => localStorage.removeItem(LOGGED_IN_KEY);
export const isLoggedIn = (): boolean => !!localStorage.getItem(LOGGED_IN_KEY);

function migrateUser(raw: any): UserAccount {
  // backward-compat: old accounts had { username, password, createdAt }
  if (raw.username && !raw.email) {
    return {
      email: raw.username,
      phone: raw.phone ?? "",
      name: raw.name ?? "",
      bkash: raw.bkash ?? "",
      password: raw.password,
      createdAt: raw.createdAt,
      photo: raw.photo ?? "",
    };
  }
  return {
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    name: raw.name ?? "",
    bkash: raw.bkash ?? "",
    password: raw.password,
    createdAt: raw.createdAt,
    photo: raw.photo ?? "",
  };
}

function getUsers(): UserAccount[] {
  try {
    const raw: any[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return raw.map(migrateUser);
  } catch {
    return [];
  }
}

function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export type RegisterResult = "ok" | "usernameExists" | "invalidInput";

export function registerUser(
  identifier: string,
  password: string,
): RegisterResult {
  const trimmed = identifier.trim();
  if (trimmed.length < 5 || password.length < 4) return "invalidInput";
  const users = getUsers();
  const exists = users.find(
    (u) =>
      u.email.toLowerCase() === trimmed.toLowerCase() ||
      (u.phone && u.phone === trimmed),
  );
  if (exists) return "usernameExists";
  users.push({
    email: trimmed,
    phone: "",
    name: "",
    bkash: "",
    password,
    createdAt: Date.now(),
    photo: "",
  });
  saveUsers(users);
  return "ok";
}

export function loginUser(identifier: string, password: string): boolean {
  const trimmed = identifier.trim();
  const users = getUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === trimmed.toLowerCase() ||
      (u.phone && u.phone === trimmed),
  );
  return !!user && user.password === password;
}

export function getDisplayName(identifier: string): string {
  const users = getUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === identifier.toLowerCase() ||
      u.phone === identifier,
  );
  if (user?.name) return user.name;
  return identifier;
}

export function updateUserProfile(
  identifier: string,
  data: { name?: string; phone?: string; bkash?: string; photo?: string },
): void {
  const users = getUsers();
  const idx = users.findIndex(
    (u) =>
      u.email.toLowerCase() === identifier.toLowerCase() ||
      u.phone === identifier,
  );
  if (idx === -1) return;
  if (data.name !== undefined) users[idx].name = data.name;
  if (data.phone !== undefined) users[idx].phone = data.phone;
  if (data.bkash !== undefined) users[idx].bkash = data.bkash;
  if (data.photo !== undefined) users[idx].photo = data.photo;
  saveUsers(users);
}

export function getUserProfile(identifier: string): UserAccount | null {
  const users = getUsers();
  return (
    users.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.phone === identifier,
    ) ?? null
  );
}

export function getAllUsers(): UserAccount[] {
  return getUsers();
}

export function deleteUser(identifier: string): void {
  const users = getUsers().filter(
    (u) => u.email !== identifier && u.phone !== identifier,
  );
  saveUsers(users);
}
