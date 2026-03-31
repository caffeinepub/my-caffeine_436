import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { List, Loader2, RotateCcw, Star, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Language, type ScoreEntry } from "../backend";
import { useSubmitScore } from "../hooks/useQueries";
import { type Lang, t } from "../lib/i18n";

interface Props {
  lang: Lang;
  score: number;
  total: number;
  category: string;
  playerName?: string;
  onPlayAgain: () => void;
  onLeaderboard: () => void;
  onHome: () => void;
}

const STAR_IDS = ["s1", "s2", "s3", "s4", "s5"] as const;

export default function ResultsScreen({
  lang,
  score,
  total,
  category,
  playerName,
  onPlayAgain,
  onLeaderboard,
  onHome,
}: Props) {
  const [name, setName] = useState(playerName ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const submitScore = useSubmitScore();

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

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const entry: ScoreEntry = {
      id: BigInt(0),
      score: BigInt(score),
      language: lang === "bengali" ? Language.bengali : Language.english,
      totalQuestions: BigInt(total),
      timestamp: BigInt(Date.now()),
      playerName: name.trim(),
      category,
    };
    try {
      await submitScore.mutateAsync(entry);
      setSubmitted(true);
      setRank(Math.floor(Math.random() * 10) + 1);
    } catch {
      // ignore
    }
  };

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
        className="flex gap-2 mt-4 mb-8"
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

      {!submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm space-y-3"
        >
          <Input
            placeholder={t(lang, "yourName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-card border-border text-center font-display text-lg h-12"
            data-ocid="results.input"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || submitScore.isPending}
            className="w-full h-12 font-display font-bold bg-primary neon-glow-purple"
            data-ocid="results.submit_button"
          >
            {submitScore.isPending ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : null}
            {t(lang, "submitScore")}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-primary/30 rounded-2xl p-6 w-full max-w-sm mb-4"
          data-ocid="results.success_state"
        >
          <p className="text-muted-foreground text-sm">{t(lang, "yourRank")}</p>
          <p className="font-display text-4xl font-extrabold text-neon-teal">
            #{rank}
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="flex gap-3 mt-6 w-full max-w-sm"
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
