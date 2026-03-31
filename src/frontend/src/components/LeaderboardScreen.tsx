import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ScoreEntry } from "../backend";
import { useGetLeaderboardByCategory } from "../hooks/useQueries";
import { CATEGORIES, type Lang, getCategoryLabel, t } from "../lib/i18n";

interface Props {
  lang: Lang;
  onBack: () => void;
}

const MEDAL = ["🥇", "🥈", "🥉"];

function LeaderboardTab({ lang, category }: { lang: Lang; category: string }) {
  const { data, isLoading } = useGetLeaderboardByCategory(category);
  const sorted = [...(data ?? [])]
    .sort((a, b) => Number(b.score) - Number(a.score))
    .slice(0, 20);

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-12"
        data-ocid="leaderboard.loading_state"
      >
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="leaderboard.empty_state"
      >
        <Trophy size={40} className="mx-auto mb-3 opacity-40" />
        <p>{t(lang, "noQuestions")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {sorted.map((entry: ScoreEntry, i: number) => (
        <motion.div
          key={`${entry.playerName}-${i}`}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-3 p-3 rounded-xl border ${
            i === 0
              ? "bg-yellow-500/10 border-yellow-500/40"
              : i === 1
                ? "bg-gray-400/10 border-gray-400/40"
                : i === 2
                  ? "bg-orange-600/10 border-orange-600/40"
                  : "bg-card border-border"
          }`}
          data-ocid={`leaderboard.item.${i + 1}`}
        >
          <span className="text-xl w-8 text-center">
            {i < 3 ? MEDAL[i] : `#${i + 1}`}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold truncate">
              {entry.playerName}
            </p>
            <p className="text-xs text-muted-foreground">
              {getCategoryLabel(lang, entry.category)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display font-extrabold text-neon-teal text-lg">
              {Number(entry.score)}
            </p>
            <p className="text-xs text-muted-foreground">
              /{Number(entry.totalQuestions)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function LeaderboardScreen({ lang, onBack }: Props) {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col"
      data-ocid="leaderboard.page"
    >
      <header className="flex items-center gap-3 p-4 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
          data-ocid="leaderboard.back_button"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-display text-2xl font-extrabold">
          🏆 {t(lang, "leaderboard")}
        </h1>
      </header>

      <div className="flex-1 px-4 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-secondary flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger
              value="All"
              className="flex-1 font-display text-xs"
              data-ocid="leaderboard.tab"
            >
              {t(lang, "all")}
            </TabsTrigger>
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.key}
                value={cat.key}
                className="flex-1 font-display text-xs"
                data-ocid="leaderboard.tab"
              >
                {cat.icon} {getCategoryLabel(lang, cat.key)}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="All">
            <LeaderboardTab lang={lang} category="All" />
          </TabsContent>
          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.key} value={cat.key}>
              <LeaderboardTab lang={lang} category={cat.key} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </motion.div>
  );
}
