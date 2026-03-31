import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Question } from "../backend";
import { type Lang, getCategoryLabel, t } from "../lib/i18n";

interface Props {
  lang: Lang;
  category: string;
  questions: Question[];
  onComplete: (score: number, total: number) => void;
  onBack: () => void;
}

const QUESTION_TIME = 15;
const MAX_QUESTIONS = 10;
const OPTION_KEYS = ["A", "B", "C", "D"] as const;

export default function QuizScreen({
  lang,
  category,
  questions,
  onComplete,
  onBack,
}: Props) {
  const limited = questions.slice(0, MAX_QUESTIONS);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [animState, setAnimState] = useState<"idle" | "correct" | "wrong">(
    "idle",
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advancedRef = useRef(false);
  const stateRef = useRef({
    idx,
    score,
    animState,
    limitedLen: limited.length,
    onComplete,
  });

  useEffect(() => {
    stateRef.current = {
      idx,
      score,
      animState,
      limitedLen: limited.length,
      onComplete,
    };
  });

  const advance = useCallback(() => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      const {
        idx: curIdx,
        score: curScore,
        animState: curAnim,
        limitedLen,
        onComplete: done,
      } = stateRef.current;
      const nextIdx = curIdx + 1;
      if (nextIdx >= limitedLen) {
        done(curScore + (curAnim === "correct" ? 1 : 0), limitedLen);
      } else {
        setIdx(nextIdx);
        setSelected(null);
        setAnimState("idle");
        setTimeLeft(QUESTION_TIME);
        advancedRef.current = false;
      }
    }, 1200);
  }, []);

  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // biome-ignore lint/correctness/useExhaustiveDependencies: idx is a reset trigger
  useEffect(() => {
    advancedRef.current = false;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setAnimState("wrong");
          setSelected(-1);
          advanceRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [idx]);

  const handleSelect = (optIdx: number) => {
    if (selected !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const q = limited[idx];
    const isCorrect = optIdx === Number(q.correctIndex);
    setSelected(optIdx);
    if (isCorrect) {
      setScore((s) => s + 1);
      setAnimState("correct");
    } else {
      setAnimState("wrong");
    }
    advance();
  };

  if (limited.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-xl text-muted-foreground mb-4">
          {t(lang, "noQuestions")}
        </p>
        <Button onClick={onBack} variant="outline" data-ocid="quiz.back_button">
          <ArrowLeft size={16} className="mr-2" />
          {t(lang, "back")}
        </Button>
      </div>
    );
  }

  const q = limited[idx];
  const progress = (idx / limited.length) * 100;
  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor =
    timeLeft <= 5
      ? "bg-destructive"
      : timeLeft <= 8
        ? "bg-neon-orange"
        : "bg-neon-teal";

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen flex flex-col"
      data-ocid="quiz.page"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
            data-ocid="quiz.back_button"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-display text-sm text-muted-foreground">
            {getCategoryLabel(lang, category)}
          </span>
          <span className="font-display font-bold text-primary">
            {t(lang, "score")}: {score}/{idx}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>
            {t(lang, "question")} {idx + 1}/{limited.length}
          </span>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${timerColor} transition-colors duration-500`}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.9, ease: "linear" }}
            />
          </div>
          <span
            className={`font-display font-bold text-lg w-8 text-right ${timeLeft <= 5 ? "text-destructive animate-timer-pulse" : "text-foreground"}`}
          >
            {timeLeft}
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
              <p className="font-display text-lg md:text-xl font-bold text-center leading-relaxed">
                {q.questionText}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, i) => {
            const isCorrect = i === Number(q.correctIndex);
            const isSelected = selected === i;
            let btnClass =
              "bg-secondary border-border hover:bg-secondary/80 hover:border-primary/50";
            let animClass = "";
            if (selected !== null) {
              if (isCorrect) {
                btnClass = "bg-neon-green/20 border-neon-green text-neon-green";
                if (isSelected) animClass = "animate-pop";
              } else if (isSelected) {
                btnClass =
                  "bg-destructive/20 border-destructive text-destructive";
                animClass = "animate-shake";
              } else {
                btnClass = "bg-secondary/40 border-border/40 opacity-50";
              }
            }
            return (
              <motion.button
                key={OPTION_KEYS[i]}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`w-full p-4 rounded-xl border-2 font-body font-semibold text-left transition-all duration-200 ${btnClass} ${animClass} disabled:cursor-default`}
                data-ocid={`quiz.item.${i + 1}`}
              >
                <span className="font-display font-bold mr-3 text-muted-foreground">
                  {OPTION_KEYS[i]}.
                </span>
                {opt}
                {selected !== null && isCorrect && (
                  <span className="ml-2">✓</span>
                )}
                {selected !== null && isSelected && !isCorrect && (
                  <span className="ml-2">✗</span>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {animState !== "idle" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`mt-4 text-center font-display font-bold text-xl ${animState === "correct" ? "text-neon-green" : "text-destructive"}`}
              data-ocid={
                animState === "correct"
                  ? "quiz.success_state"
                  : "quiz.error_state"
              }
            >
              {animState === "correct"
                ? t(lang, "correct")
                : selected === -1
                  ? t(lang, "timeUp")
                  : t(lang, "wrong")}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
