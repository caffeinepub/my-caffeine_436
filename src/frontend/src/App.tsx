import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { Language, type Question } from "./backend";
import AdminPanel from "./components/AdminPanel";
import HomeScreen from "./components/HomeScreen";
import InstallBanner from "./components/InstallBanner";
import LeaderboardScreen from "./components/LeaderboardScreen";
import LoginScreen from "./components/LoginScreen";
import ProfileModal from "./components/ProfileModal";
import QuizScreen from "./components/QuizScreen";
import ResultsScreen from "./components/ResultsScreen";
import WalletModal from "./components/WalletModal";
import { useActor } from "./hooks/useActor";
import { useGetQuestionsByCategoryAndLanguage } from "./hooks/useQueries";
import {
  clearUsername,
  getUserProfile,
  getUsername,
  setUsername,
} from "./lib/auth";
import type { Lang } from "./lib/i18n";
import { applyQuizResult } from "./lib/quizStats";
import {
  getFallbackQuestions,
  pickUniqueQuestions,
} from "./lib/sampleQuestions";
import { getBalance } from "./lib/wallet";

type Screen = "home" | "quiz" | "results" | "leaderboard" | "admin";

export default function App() {
  const { actor } = useActor();
  const [username, setUsernameState] = useState<string | null>(() =>
    getUsername(),
  );
  const [screen, setScreen] = useState<Screen>("home");
  const [lang, setLang] = useState<Lang>("bengali");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [finalWrong, setFinalWrong] = useState(0);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [deductedAmount, setDeductedAmount] = useState(0);
  const [balance, setBalance] = useState(() => getBalance());
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [walletMode, setWalletMode] = useState<
    "deposit" | "withdraw" | "history" | null
  >(null);
  const [initialized, setInitialized] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>(() => {
    const u = getUsername();
    if (!u) return "";
    return getUserProfile(u)?.photo ?? "";
  });

  const isLoggedIn = !!username;

  useEffect(() => {
    if (actor && !initialized) {
      setInitialized(true);
      actor.initializeData().catch(() => {});
    }
  }, [actor, initialized]);

  const language = lang === "bengali" ? Language.bengali : Language.english;
  const { data: fetchedQuestions } = useGetQuestionsByCategoryAndLanguage(
    selectedCategory,
    language,
  );

  const getQuestionsForQuiz = (): Question[] => {
    const backend = fetchedQuestions ?? [];
    if (backend.length > 0) return pickUniqueQuestions(backend);
    return getFallbackQuestions(selectedCategory, language);
  };

  const handleLogin = (u: string) => {
    setUsername(u);
    setUsernameState(u);
    setProfilePhoto(getUserProfile(u)?.photo ?? "");
  };

  const handleLogout = () => {
    clearUsername();
    setUsernameState(null);
    setProfilePhoto("");
    setScreen("home");
  };

  const handleStartQuiz = () => {
    if (!selectedCategory) return;
    if (!username) return;
    setQuizQuestions(getQuestionsForQuiz());
    setScreen("quiz");
  };

  const handleQuizComplete = (
    score: number,
    total: number,
    wrongCount: number,
  ) => {
    setFinalScore(score);
    setFinalTotal(total);
    setFinalWrong(wrongCount);
    const { earned, deducted } = applyQuizResult(
      username ?? "guest",
      score,
      wrongCount,
    );
    setEarnedAmount(earned);
    setDeductedAmount(deducted);
    setBalance(getBalance());
    setScreen("results");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background max-w-lg mx-auto relative overflow-hidden">
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <div className="absolute top-[-10%] left-[-10%] w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <AnimatePresence mode="wait">
          <LoginScreen key="login" onLogin={handleLogin} />
        </AnimatePresence>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div
          className="absolute top-[40%] right-[-5%] w-60 h-60 rounded-full"
          style={{ background: "oklch(0.65 0.22 328 / 8%)" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {screen === "home" && (
          <HomeScreen
            key="home"
            lang={lang}
            onLangToggle={() =>
              setLang((l) => (l === "bengali" ? "english" : "bengali"))
            }
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onStartQuiz={handleStartQuiz}
            onLeaderboard={() => setScreen("leaderboard")}
            onOpenAdmin={() => setScreen("admin")}
            balance={balance}
            onDeposit={() => setWalletMode("deposit")}
            onWithdraw={() => setWalletMode("withdraw")}
            onHistory={() => setWalletMode("history")}
            username={username}
            onLogout={handleLogout}
            onOpenProfile={() => setProfileOpen(true)}
            profilePhoto={profilePhoto}
          />
        )}
        {screen === "quiz" && (
          <QuizScreen
            key="quiz"
            lang={lang}
            category={selectedCategory}
            questions={quizQuestions}
            onComplete={handleQuizComplete}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "results" && (
          <ResultsScreen
            key="results"
            lang={lang}
            score={finalScore}
            total={finalTotal}
            wrongCount={finalWrong}
            category={selectedCategory}
            playerName={username ?? undefined}
            earned={earnedAmount}
            deducted={deductedAmount}
            onPlayAgain={() => {
              setQuizQuestions(getQuestionsForQuiz());
              setScreen("quiz");
            }}
            onLeaderboard={() => setScreen("leaderboard")}
            onHome={() => {
              setBalance(getBalance());
              setScreen("home");
            }}
          />
        )}
        {screen === "leaderboard" && (
          <LeaderboardScreen
            key="leaderboard"
            lang={lang}
            onBack={() => setScreen("home")}
          />
        )}
        {screen === "admin" && (
          <AdminPanel
            key="admin"
            lang={lang}
            onBack={() => setScreen("home")}
          />
        )}
      </AnimatePresence>

      {screen === "home" && (
        <footer className="relative z-10 text-center py-4 pb-6 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-accent transition-colors"
            >
              caffeine.ai
            </a>
          </span>
          <div className="mt-2 font-bold text-sm tracking-widest">
            <a
              href="https://kananbala.com"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:text-accent transition-colors"
            >
              kananbala.com
            </a>
          </div>
        </footer>
      )}

      <WalletModal
        lang={lang}
        open={walletMode !== null}
        mode={walletMode}
        onClose={() => setWalletMode(null)}
        onBalanceChange={setBalance}
        isLoggedIn={isLoggedIn}
      />

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        identifier={username ?? ""}
        onPhotoChange={setProfilePhoto}
      />

      <InstallBanner />

      <Toaster />
    </div>
  );
}
