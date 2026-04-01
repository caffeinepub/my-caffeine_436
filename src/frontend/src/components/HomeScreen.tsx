import { Button } from "@/components/ui/button";
import {
  Clock,
  LogOut,
  TrendingDown,
  TrendingUp,
  Trophy,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useGetActiveNotices, useGetActivePosts } from "../hooks/useQueries";
import { getDisplayName } from "../lib/auth";
import { CATEGORIES, type Lang, getCategoryLabel, t } from "../lib/i18n";
import { playClick } from "../lib/sounds";
import InviteSection from "./InviteSection";
import LinkedAccountsSection from "./LinkedAccountsSection";
import WithdrawTicker from "./WithdrawTicker";

interface Props {
  lang: Lang;
  onLangToggle: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onStartQuiz: () => void;
  onLeaderboard: () => void;
  onOpenAdmin: () => void;
  balance: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  onHistory: () => void;
  username: string | null;
  onLogout: () => void;
  onOpenProfile: () => void;
  profilePhoto?: string;
}

const categoryGradients = [
  "from-teal-500/20 to-cyan-600/20 border-teal-500/40 hover:border-teal-400",
  "from-orange-400/20 to-amber-500/20 border-orange-400/40 hover:border-orange-400",
  "from-pink-500/20 to-rose-600/20 border-pink-500/40 hover:border-pink-400",
  "from-green-500/20 to-emerald-600/20 border-green-500/40 hover:border-green-400",
];

const categoryGlows = [
  "neon-glow-teal",
  "neon-glow-orange",
  "neon-glow-pink",
  "neon-glow-green",
];

export default function HomeScreen({
  lang,
  onLangToggle,
  selectedCategory,
  onSelectCategory,
  onStartQuiz,
  onLeaderboard,
  onOpenAdmin,
  balance,
  onDeposit,
  onWithdraw,
  onHistory,
  username,
  onLogout,
  onOpenProfile,
  profilePhoto,
}: Props) {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [adminHint, setAdminHint] = useState(false);

  const { data: notices } = useGetActiveNotices();
  const { data: posts } = useGetActivePosts();

  const hasNotices = notices && notices.length > 0;
  const hasPosts = posts && posts.length > 0;

  const handleTitleTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      onOpenAdmin();
      return;
    }
    if (tapCount.current === 3) {
      setAdminHint(true);
      setTimeout(() => setAdminHint(false), 1500);
    }
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col"
      data-ocid="home.page"
    >
      <header className="flex items-center justify-between p-4 pt-6">
        <button
          type="button"
          onClick={handleTitleTap}
          className="text-xs text-muted-foreground font-display tracking-widest uppercase select-none cursor-default"
          aria-label="কুইজ গেম"
        >
          কুইজ গেম
          {adminHint && (
            <span className="ml-1 text-primary opacity-60">···</span>
          )}
        </button>
        <div className="flex items-center gap-2">
          {username ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  onOpenProfile();
                }}
                className="flex items-center gap-1.5 bg-secondary border border-border rounded-full px-2 py-1 hover:border-primary/60 transition-colors"
                title="প্রোফাইল দেখুন"
                data-ocid="home.button"
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="profile"
                    className="w-6 h-6 rounded-full object-cover border border-primary/40"
                  />
                ) : (
                  <User size={12} className="text-accent" />
                )}
                <span className="text-xs font-display text-accent">
                  {getDisplayName(username)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  onLogout();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="লগআউট"
                data-ocid="home.button"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={onLangToggle}
            className="border-primary/50 text-primary font-display text-xs"
            data-ocid="home.toggle"
          >
            {t(lang, "langToggle")}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-6 mt-4"
        >
          <h1 className="font-display text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-primary via-accent to-neon-pink bg-clip-text text-transparent leading-tight mb-2">
            {t(lang, "appTitle")}
          </h1>
          <p className="text-muted-foreground text-lg font-body">
            {t(lang, "appSubtitle")}
          </p>
        </motion.div>

        {/* Notices */}
        {hasNotices && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="w-full max-w-md mb-6"
          >
            <h2 className="font-display text-sm font-bold mb-2 text-amber-400 uppercase tracking-wider">
              📢 ঘোষণা
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex-shrink-0 w-64 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3"
                  data-ocid="home.card"
                >
                  <p className="font-display font-bold text-sm text-amber-300 mb-1 truncate">
                    {notice.title}
                  </p>
                  <p className="text-xs text-amber-100/70 leading-relaxed line-clamp-3">
                    {notice.content}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md mb-6 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wider font-display">
                💰 {t(lang, "balance")}
              </p>
              <p className="text-3xl font-display font-extrabold text-neon-teal mt-1">
                ৳{balance.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                প্রতি ৮ সঠিক = +৳১০ | ভুল = -৳২
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => {
                  playClick();
                  onDeposit();
                }}
                className="bg-neon-green text-background font-bold neon-glow-green text-xs h-8"
                data-ocid="wallet.deposit_button"
              >
                <TrendingUp size={14} className="mr-1" />
                {t(lang, "deposit")}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  playClick();
                  onWithdraw();
                }}
                className="bg-neon-orange text-background font-bold neon-glow-orange text-xs h-8"
                data-ocid="wallet.withdraw_button"
              >
                <TrendingDown size={14} className="mr-1" />
                {t(lang, "withdraw")}
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playClick();
              onHistory();
            }}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            data-ocid="wallet.history_button"
          >
            <Clock size={12} />
            {t(lang, "txHistory")}
          </button>
        </motion.div>

        {/* Category Selection */}
        <div className="w-full max-w-md">
          <h2 className="font-display text-lg font-bold mb-4 text-center text-muted-foreground uppercase tracking-wider">
            {t(lang, "selectCategory")}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.key}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.08 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  playClick();
                  onSelectCategory(cat.key);
                }}
                className={`relative p-5 rounded-2xl border-2 bg-gradient-to-br ${categoryGradients[i]} transition-all duration-200 text-left ${
                  selectedCategory === cat.key ? categoryGlows[i] : ""
                }`}
                data-ocid={`home.item.${i + 1}`}
              >
                {selectedCategory === cat.key && (
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary animate-pulse" />
                )}
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="font-display font-bold text-sm leading-tight">
                  {getCategoryLabel(lang, cat.key)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cat.key}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="w-full max-w-md mt-8 space-y-3"
        >
          <Button
            onClick={() => {
              playClick();
              onStartQuiz();
            }}
            disabled={!selectedCategory}
            className="w-full h-14 font-display text-lg font-extrabold bg-primary neon-glow-purple rounded-xl disabled:opacity-40"
            data-ocid="home.primary_button"
          >
            🚀 {t(lang, "startQuiz")}
          </Button>
          <Button
            onClick={() => {
              playClick();
              onLeaderboard();
            }}
            variant="outline"
            className="w-full h-12 font-display font-bold border-accent/50 text-accent hover:bg-accent/10"
            data-ocid="home.secondary_button"
          >
            <Trophy size={18} className="mr-2" />
            {t(lang, "leaderboard")}
          </Button>
        </motion.div>

        {/* Withdraw Ticker */}
        <div className="w-full max-w-md mt-6">
          <WithdrawTicker />
        </div>

        {/* Linked Accounts Section */}
        <LinkedAccountsSection
          userId={username || "guest"}
          onBalanceChange={onDeposit}
        />

        {/* Invite Section */}
        <InviteSection />

        {/* Post / News Feed */}
        {hasPosts && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="w-full max-w-md mt-6"
          >
            <h2 className="font-display text-sm font-bold mb-3 text-purple-400 uppercase tracking-wider">
              📰 নিউজফিড
            </h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 overflow-hidden"
                  data-ocid="home.card"
                >
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-4">
                    <p className="font-display font-bold text-sm text-purple-300 mb-1">
                      {post.title}
                    </p>
                    <p className="text-xs text-purple-100/70 leading-relaxed">
                      {post.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(post.createdAt).toLocaleDateString("bn-BD")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
