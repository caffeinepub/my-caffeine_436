import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  PLATFORM_INFO,
  type PlatformType,
  getUserLinkedPlatforms,
  linkAccount,
} from "../lib/linkedAccounts";
import { deposit } from "../lib/wallet";

interface LinkedAccountsSectionProps {
  userId: string;
  onBalanceChange?: () => void;
}

const BONUS_AMOUNT = 100;

const platforms: PlatformType[] = [
  "facebook",
  "telegram",
  "email",
  "binance",
  "quotex",
];

function FacebookIcon() {
  return (
    <svg
      aria-label="Facebook"
      role="img"
      viewBox="0 0 24 24"
      fill="#1877F2"
      className="w-8 h-8"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg
      aria-label="Telegram"
      role="img"
      viewBox="0 0 24 24"
      fill="#229ED9"
      className="w-8 h-8"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      aria-label="Email"
      role="img"
      viewBox="0 0 24 24"
      fill="none"
      className="w-8 h-8"
    >
      <rect width="24" height="24" rx="4" fill="#EA4335" />
      <path
        d="M4 7l8 5 8-5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="4"
        y="7"
        width="16"
        height="10"
        rx="1"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

function BinanceIcon() {
  return (
    <svg
      aria-label="Binance"
      role="img"
      viewBox="0 0 24 24"
      fill="#F3BA2F"
      className="w-8 h-8"
    >
      <path d="M12 0L7.27 4.73 4.77 2.23 0 7l4.77 4.77-2.5 2.5L7 18.77l2.5-2.5L12 18.54l2.5-2.27L17 18.77l4.73-4.5-2.5-2.5L24 7l-4.77-4.77-2.5 2.5L12 0zm0 3.68l2.27 2.05-2.27 2.27-2.27-2.27L12 3.68zM5.27 7l2.27-2.27 2.27 2.27L7.54 9.27 5.27 7zm13.46 0l-2.27 2.27-2.27-2.27 2.27-2.27L18.73 7zM12 9.46l2.27 2.27-2.27 2.27-2.27-2.27L12 9.46zm-6.73 2.77l2.27 2.27-2.27 2.27-2.27-2.27 2.27-2.27zm13.46 0l2.27 2.27-2.27 2.27-2.27-2.27 2.27-2.27zM12 15.23l2.27 2.05-2.27 2.27-2.27-2.27L12 15.23z" />
    </svg>
  );
}

function QuotexIcon() {
  return (
    <img
      src="/assets/generated/quotex-logo-transparent.dim_200x200.png"
      alt="Quotex"
      className="w-8 h-8 object-contain rounded-full"
    />
  );
}

const PlatformIcons: Record<PlatformType, React.FC> = {
  facebook: FacebookIcon,
  telegram: TelegramIcon,
  email: EmailIcon,
  binance: BinanceIcon,
  quotex: QuotexIcon,
};

interface AddAccountModalProps {
  platform: PlatformType;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AddAccountModal({
  platform,
  userId,
  onClose,
  onSuccess,
}: AddAccountModalProps) {
  const info = PLATFORM_INFO[platform];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const Icon = PlatformIcons[platform];

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      setError("সব তথ্য পূরণ করুন");
      return;
    }
    setLoading(true);
    const result = linkAccount(userId, platform, email.trim(), password);
    if (result.success) {
      deposit(BONUS_AMOUNT);
      onSuccess();
    } else {
      setError("এই একাউন্ট আগেই যোগ হয়েছে");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon />
            <span className="font-display font-bold text-base">
              {info.label} যোগ করুন
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4 text-center">
          <p className="text-green-400 font-display font-bold text-sm">
            +৳{BONUS_AMOUNT} ব্যালেন্স পাবেন!
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="linked-email"
              className="text-xs text-muted-foreground mb-1 block"
            >
              ইমেইল
            </label>
            <Input
              id="linked-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ইমেইল লিখুন"
              className="font-sans"
            />
          </div>
          <div>
            <label
              htmlFor="linked-password"
              className="text-xs text-muted-foreground mb-1 block"
            >
              পাসওয়ার্ড
            </label>
            <Input
              id="linked-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড লিখুন"
              className="font-sans"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full font-display font-bold"
          >
            একাউন্ট যোগ করুন ও ৳{BONUS_AMOUNT} পান
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function LinkedAccountsSection({
  userId,
  onBalanceChange,
}: LinkedAccountsSectionProps) {
  const [openPlatform, setOpenPlatform] = useState<PlatformType | null>(null);
  const [successPlatform, setSuccessPlatform] = useState<PlatformType | null>(
    null,
  );
  const [linked, setLinked] = useState<PlatformType[]>(() =>
    getUserLinkedPlatforms(userId),
  );

  const handleSuccess = () => {
    if (openPlatform) {
      setSuccessPlatform(openPlatform);
      setLinked((prev) => [...prev, openPlatform]);
      setOpenPlatform(null);
      onBalanceChange?.();
      setTimeout(() => setSuccessPlatform(null), 3000);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-md mt-6"
      >
        <h2 className="font-display text-sm font-bold mb-1 text-yellow-400 uppercase tracking-wider">
          💰 একাউন্ট যোগ করুন
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          প্রতিটি একাউন্ট যোগ করলে{" "}
          <span className="text-green-400 font-bold">৳{BONUS_AMOUNT}</span> পাবেন
        </p>

        <div className="grid grid-cols-5 gap-2">
          {platforms.map((platform) => {
            const info = PLATFORM_INFO[platform];
            const isLinked = linked.includes(platform);
            const Icon = PlatformIcons[platform];

            return (
              <button
                type="button"
                key={platform}
                onClick={() => !isLinked && setOpenPlatform(platform)}
                disabled={isLinked}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                  isLinked
                    ? "border-green-500/50 bg-green-500/10 opacity-80 cursor-default"
                    : "border-border bg-card hover:border-yellow-400/50 hover:bg-yellow-400/5 active:scale-95"
                }`}
              >
                <div className="relative">
                  <Icon />
                  {isLinked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-display font-semibold leading-tight text-center">
                  {info.label}
                </span>
                {isLinked ? (
                  <span className="text-[9px] text-green-400 font-bold">
                    ✓ যোগ হয়েছে
                  </span>
                ) : (
                  <span className="text-[9px] text-yellow-400 font-bold">
                    +৳{BONUS_AMOUNT}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {successPlatform && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-3 bg-green-500/20 border border-green-500/40 rounded-xl p-3 text-center"
            >
              <p className="text-green-400 font-display font-bold text-sm">
                🎉 {PLATFORM_INFO[successPlatform].label} যোগ হয়েছে! +৳
                {BONUS_AMOUNT} ব্যালেন্সে যোগ হয়েছে
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {openPlatform && (
        <AddAccountModal
          platform={openPlatform}
          userId={userId}
          onClose={() => setOpenPlatform(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
