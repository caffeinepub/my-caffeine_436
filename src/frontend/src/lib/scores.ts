// localStorage-based leaderboard scores

export interface LocalScore {
  id: number;
  playerName: string;
  score: number;
  total: number;
  category: string;
  timestamp: number;
}

const KEY = "quizScores";

function load(): LocalScore[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(ss: LocalScore[]): void {
  localStorage.setItem(KEY, JSON.stringify(ss));
}

export function addScore(
  playerName: string,
  score: number,
  total: number,
  category: string,
): LocalScore {
  const ss = load();
  const maxId = ss.reduce((m, s) => Math.max(m, s.id), 0);
  const entry: LocalScore = {
    id: maxId + 1,
    playerName,
    score,
    total,
    category,
    timestamp: Date.now(),
  };
  ss.unshift(entry);
  // Keep max 200 scores
  save(ss.slice(0, 200));
  return entry;
}

export function getTopScores(limit = 20, category?: string): LocalScore[] {
  let ss = load();
  if (category && category !== "All") {
    ss = ss.filter((s) => s.category === category);
  }
  return ss.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function getPlayerRank(
  playerName: string,
  score: number,
  category: string,
): number {
  const ss = load().filter(
    (s) => s.category === category || category === "All",
  );
  const sorted = ss.sort((a, b) => b.score - a.score);
  const idx = sorted.findIndex(
    (s) => s.playerName === playerName && s.score === score,
  );
  return idx === -1 ? sorted.length + 1 : idx + 1;
}
