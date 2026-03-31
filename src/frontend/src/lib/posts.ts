// localStorage-based posts management

export interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: number;
}

const KEY = "quizPosts";

function load(): Post[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(ps: Post[]): void {
  localStorage.setItem(KEY, JSON.stringify(ps));
}

export function getPosts(): Post[] {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

export function addPost(
  title: string,
  content: string,
  imageUrl: string,
): Post {
  const ps = load();
  const maxId = ps.reduce((m, p) => Math.max(m, p.id), 0);
  const post: Post = {
    id: maxId + 1,
    title,
    content,
    imageUrl,
    createdAt: Date.now(),
  };
  ps.unshift(post);
  save(ps);
  return post;
}

export function updatePost(id: number, updates: Partial<Post>): void {
  const ps = load().map((p) => (p.id === id ? { ...p, ...updates } : p));
  save(ps);
}

export function deletePost(id: number): void {
  save(load().filter((p) => p.id !== id));
}
