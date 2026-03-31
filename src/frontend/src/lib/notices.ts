// localStorage-based notices management

export interface Notice {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: number;
}

const KEY = "quizNotices";

function load(): Notice[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(ns: Notice[]): void {
  localStorage.setItem(KEY, JSON.stringify(ns));
}

export function getNotices(): Notice[] {
  return load();
}

export function getActiveNotices(): Notice[] {
  return load().filter((n) => n.isActive);
}

export function addNotice(title: string, content: string): Notice {
  const ns = load();
  const maxId = ns.reduce((m, n) => Math.max(m, n.id), 0);
  const notice: Notice = {
    id: maxId + 1,
    title,
    content,
    isActive: true,
    createdAt: Date.now(),
  };
  ns.unshift(notice);
  save(ns);
  return notice;
}

export function updateNotice(id: number, updates: Partial<Notice>): void {
  const ns = load().map((n) => (n.id === id ? { ...n, ...updates } : n));
  save(ns);
}

export function deleteNotice(id: number): void {
  save(load().filter((n) => n.id !== id));
}
