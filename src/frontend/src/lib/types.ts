// Local type definitions

export interface UserAccount {
  username: string;
  password: string;
  createdAt: number;
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

export type RegisterResult =
  | { ok: null }
  | { usernameExists: null }
  | { invalidInput: null };
