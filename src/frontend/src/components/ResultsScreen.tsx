import { Button } from "@/components/ui/button";
import { List, RotateCcw, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useSubmitLocalScore } from "../hooks/useQueries";
import { type Lang, t } from "../lib/i18n";
import { playSuccess } from "../lib/sounds";

interface Props {
  lang: Lang;
  score: number;
  total: number;
  wrongCount: number;
  category: string;
  playerName?: string;
  earned: number;
  deducted: number;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
  onHome: () => void;
}

const STAR_IDS = ["s1", "s2", "s3", "s4", "s5"] as const;

export default function ResultsScreen({
  lang,
  score,
  total,
  wrongCount,
  category,
  playerName,
  earned,
  deducted,
  onPlayAgain,
  onLeaderboard,
  onHome,
}: Props) {
  const [rank, setRank] = useState<number | null>(null);
  const submitted = useRef(false);
  const submitScore = useSubmitLocalScore();

  const pct = total > 0 ? (score / total) * 100 : 0;
  const badge =
    pct >= 90
      ? t(lang, "excellent")
      : pct >= 70
        ? t(lang, "good")
        : t(lang, "tryAgain");
  const badgeColor =
    pct >= 90
      ? "text-neon-green"
      : pct >= 70
        ? "text-neon-orange"
        : "text-neon-pink";

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional run-once
  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    playSuccess();
    const name = playerName?.trim() || "অনিমন্ত্রিত";
    submitScore
      .mutateAsync({ playerName: name, score, total, category })
      .then((entry) => {
        // Calculate rank: rank = position in leaderboard
        setRank(entry.id);
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      data-ocid="results.page"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        className="text-8xl mb-4"
      >
        {pct >= 90 ? "🏆" : pct >= 70 ? "⭐" : "💪"}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-muted-foreground uppercase tracking-wider text-sm font-display mb-2">
          {t(lang, "results")}
        </p>
        <p className="font-display text-7xl font-extrabold text-foreground">
          {score}
          <span className="text-muted-foreground text-4xl">/{total}</span>
        </p>
        <p className={`font-display text-2xl font-bold mt-3 ${badgeColor}`}>
          {badge}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex gap-2 mt-4 mb-6"
      >
        {STAR_IDS.map((id, i) => (
          <Star
            key={id}
            size={24}
            className={
              i < Math.round((pct / 100) * 5)
                ? "text-neon-orange fill-neon-orange"
                : "text-muted"
            }
          />
        ))}
      </motion.div>

      {/* Balance change summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 mb-4"
      >
        {earned > 0 && (
          <div className="bg-green-500/10 border border-green-500/40 rounded-xl px-4 py-2">
            <p className="text-green-400 font-bold text-lg">+৳{earned}</p>
            <p className="text-xs text-muted-foreground">বোনাস পাওয়া গেছে!</p>
          </div>
        )}
        {deducted > 0 && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-2">
            <p className="text-red-400 font-bold text-lg">-৳{deducted}</p>
            <p className="text-xs text-muted-foreground">
              {wrongCount} ভুল উত্তর
            </p>
          </div>
        )}
        {earned === 0 && deducted === 0 && (
          <div className="bg-secondary border border-border rounded-xl px-4 py-2">
            <p className="text-sm text-muted-foreground">ব্যালেন্স অপরিবর্তিত</p>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55 }}
        className="bg-card border border-primary/30 rounded-2xl p-4 w-full max-w-sm mb-4"
        data-ocid="results.success_state"
      >
        <p className="text-muted-foreground text-xs mb-1">🏅 স্কোর জমা হয়েছে</p>
        <p className="font-display font-bold">{playerName}</p>
        {rank !== null && (
          <p className="text-neon-teal font-display font-extrabold text-2xl mt-1">
            🏆 #{rank} র্যাংক
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          সঠিক: {score} | ভুল: {wrongCount}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="flex gap-3 mt-2 w-full max-w-sm"
      >
        <Button
          variant="outline"
          onClick={onPlayAgain}
          className="flex-1 h-12 font-display font-bold border-primary/50 text-primary"
          data-ocid="results.secondary_button"
        >
          <RotateCcw size={16} className="mr-2" />
          {t(lang, "playAgain")}
        </Button>
        <Button
          variant="outline"
          onClick={onLeaderboard}
          className="flex-1 h-12 font-display font-bold border-accent/50 text-accent"
          data-ocid="results.secondary_button"
        >
          <Trophy size={16} className="mr-2" />
          {t(lang, "leaderboard")}
        </Button>
      </motion.div>

      <button
        type="button"
        onClick={onHome}
        className="mt-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-[44px]"
        data-ocid="results.button"
      >
        <List size={14} />
        {t(lang, "backToHome")}
      </button>
    </motion.div>
  );
}
