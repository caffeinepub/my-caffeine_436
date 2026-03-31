export type PlatformType =
  | "facebook"
  | "telegram"
  | "email"
  | "binance"
  | "quotex";

export interface LinkedAccount {
  id: string;
  userId: string;
  platform: PlatformType;
  username: string; // email
  password: string;
  addedAt: number;
}

const LINKED_ACCOUNTS_KEY = "quizLinkedAccounts";
const USER_LINKED_KEY = (userId: string) => `quizUserLinked_${userId}`;

export function getAllLinkedAccounts(): LinkedAccount[] {
  const raw = localStorage.getItem(LINKED_ACCOUNTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAllLinkedAccounts(accounts: LinkedAccount[]): void {
  localStorage.setItem(LINKED_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getUserLinkedPlatforms(userId: string): PlatformType[] {
  const raw = localStorage.getItem(USER_LINKED_KEY(userId));
  return raw ? JSON.parse(raw) : [];
}

function saveUserLinkedPlatforms(
  userId: string,
  platforms: PlatformType[],
): void {
  localStorage.setItem(USER_LINKED_KEY(userId), JSON.stringify(platforms));
}

export function linkAccount(
  userId: string,
  platform: PlatformType,
  username: string,
  password: string,
): { success: boolean; error?: string } {
  const linked = getUserLinkedPlatforms(userId);
  if (linked.includes(platform)) {
    return { success: false, error: "alreadyLinked" };
  }

  const all = getAllLinkedAccounts();
  const newAccount: LinkedAccount = {
    id: Date.now().toString(),
    userId,
    platform,
    username,
    password,
    addedAt: Date.now(),
  };
  all.unshift(newAccount);
  saveAllLinkedAccounts(all);

  linked.push(platform);
  saveUserLinkedPlatforms(userId, linked);

  return { success: true };
}

export const PLATFORM_INFO: Record<
  PlatformType,
  { label: string; icon: string; usernameLabel: string; color: string }
> = {
  facebook: {
    label: "Facebook",
    icon: "facebook",
    usernameLabel: "ইমেইল",
    color: "#1877F2",
  },
  telegram: {
    label: "Telegram",
    icon: "telegram",
    usernameLabel: "ইমেইল",
    color: "#229ED9",
  },
  email: {
    label: "Email",
    icon: "email",
    usernameLabel: "ইমেইল",
    color: "#EA4335",
  },
  binance: {
    label: "Binance",
    icon: "binance",
    usernameLabel: "ইমেইল",
    color: "#F3BA2F",
  },
  quotex: {
    label: "Quotex",
    icon: "quotex",
    usernameLabel: "ইমেইল",
    color: "#00C853",
  },
};
