// Track quiz statistics for balance rewards per user
import { addTransaction, getBalance, setBalance } from "./wallet";

interface UserStats {
  totalCorrect: number;
  correctSetsRewarded: number; // how many sets of 8 already rewarded
}

const KEY = "quizUserStats";

function loadStats(username: string): UserStats {
  try {
    const raw = localStorage.getItem(KEY);
    const all = raw ? JSON.parse(raw) : {};
    return all[username] ?? { totalCorrect: 0, correctSetsRewarded: 0 };
  } catch {
    return { totalCorrect: 0, correctSetsRewarded: 0 };
  }
}

function saveStats(username: string, stats: UserStats): void {
  try {
    const raw = localStorage.getItem(KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[username] = stats;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {}
}

export function applyQuizResult(
  username: string,
  correctCount: number,
  wrongCount: number,
): { earned: number; deducted: number } {
  const stats = loadStats(username);

  // Deduct for wrong answers
  const deducted = wrongCount * 2;
  if (deducted > 0) {
    const current = getBalance();
    const newBal = Math.max(0, current - deducted);
    setBalance(newBal);
    if (current > 0) {
      addTransaction("withdraw", deducted);
    }
  }

  // Add for correct answer milestones (every 8)
  const newTotal = stats.totalCorrect + correctCount;
  const newSetsEarned = Math.floor(newTotal / 8);
  const newRewards = newSetsEarned - stats.correctSetsRewarded;
  const earned = newRewards * 10;
  if (earned > 0) {
    const current = getBalance();
    setBalance(current + earned);
    addTransaction("deposit", earned);
  }

  saveStats(username, {
    totalCorrect: newTotal,
    correctSetsRewarded: newSetsEarned,
  });

  return { earned, deducted };
}

export function getUserStats(username: string): UserStats {
  return loadStats(username);
}
