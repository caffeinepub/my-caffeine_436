import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Clock,
  CreditCard,
  Loader2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { type Lang, t } from "../lib/i18n";
import {
  type Transaction,
  deposit,
  getBalance,
  getTransactions,
  withdraw,
} from "../lib/wallet";

interface Props {
  lang: Lang;
  open: boolean;
  mode: "deposit" | "withdraw" | "history" | null;
  onClose: () => void;
  onBalanceChange: (balance: number) => void;
  isLoggedIn: boolean;
}

type PaymentMethod = "card" | "bkash" | "nagad" | "rocket" | "upay" | "usdt";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  logo?: string;
  color: string;
  phone?: boolean;
  address?: boolean;
}[] = [
  { id: "card", label: "ব্যাংক কার্ড", color: "#0ea5e9" },
  {
    id: "bkash",
    label: "বিকাশ",
    logo: "/assets/generated/bkash-logo-transparent.dim_200x200.png",
    color: "#E2136E",
    phone: true,
  },
  {
    id: "nagad",
    label: "নগদ",
    logo: "/assets/generated/nagad-logo-transparent.dim_200x200.png",
    color: "#F06522",
    phone: true,
  },
  {
    id: "rocket",
    label: "রকেট",
    logo: "/assets/generated/rocket-logo-transparent.dim_200x200.png",
    color: "#8B2FC9",
    phone: true,
  },
  {
    id: "upay",
    label: "উপায়",
    logo: "/assets/generated/upay-logo-transparent.dim_200x200.png",
    color: "#00A551",
    phone: true,
  },
  {
    id: "usdt",
    label: "USDT",
    logo: "/assets/generated/usdt-logo-transparent.dim_200x200.png",
    color: "#26A17B",
    address: true,
  },
];

export default function WalletModal({
  lang,
  open,
  mode,
  onClose,
  onBalanceChange,
  isLoggedIn: _isLoggedIn,
}: Props) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [mobileNumber, setMobileNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const handleDeposit = async () => {
    setError("");
    const num = Number.parseFloat(amount);
    if (!num || num <= 0) {
      setError(t(lang, "invalidAmount"));
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        setError("কার্ডের তথ্য পূরণ করুন");
        return;
      }
    } else if (paymentMethod === "usdt") {
      if (!walletAddress || !transactionId) {
        setError("ওয়ালেট ঠিকানা এবং ট্রানজেকশন আইডি দিন");
        return;
      }
    } else {
      if (!mobileNumber || !transactionId) {
        setError("মোবাইল নম্বর এবং ট্রানজেকশন আইডি দিন");
        return;
      }
    }

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsProcessing(false);
    const result = deposit(num);
    if (result.success) {
      setSuccessMsg(t(lang, "depositSuccess"));
      onBalanceChange(getBalance());
      setAmount("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvc("");
      setCardName("");
      setMobileNumber("");
      setTransactionId("");
      setWalletAddress("");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1200);
    } else {
      setError(t(lang, result.error ?? "invalidAmount"));
    }
  };

  const handleWithdraw = () => {
    setError("");
    const num = Number.parseFloat(amount);
    const result = withdraw(num);
    if (result.success) {
      setSuccessMsg(t(lang, "withdrawSuccess"));
      onBalanceChange(getBalance());
      setAmount("");
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1200);
    } else {
      setError(t(lang, result.error ?? "invalidAmount"));
    }
  };

  const handleAction = () => {
    if (mode === "deposit") handleDeposit();
    else if (mode === "withdraw") handleWithdraw();
  };

  const transactions: Transaction[] = getTransactions();

  const modalTitle =
    mode === "history"
      ? t(lang, "txHistory")
      : mode === "deposit"
        ? t(lang, "deposit")
        : t(lang, "withdraw");

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod)!;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Wallet className="text-neon-teal" size={22} />
            {modalTitle}
          </DialogTitle>
        </DialogHeader>

        {mode === "history" ? (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {t(lang, "noTransactions")}
              </p>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                >
                  <div className="flex items-center gap-2">
                    {tx.type === "deposit" ? (
                      <TrendingUp size={16} className="text-neon-green" />
                    ) : (
                      <TrendingDown size={16} className="text-destructive" />
                    )}
                    <span className="text-sm capitalize">
                      {tx.type === "deposit"
                        ? t(lang, "deposit")
                        : t(lang, "withdraw")}
                    </span>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-sm ${tx.type === "deposit" ? "text-neon-green" : "text-destructive"}`}
                    >
                      {tx.type === "deposit" ? "+" : "-"}৳{tx.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : mode === "deposit" ? (
          <div className="space-y-4">
            {/* Amount */}
            <div>
              <Label
                htmlFor="wallet-amount"
                className="text-sm text-muted-foreground block mb-1"
              >
                {t(lang, "amount")} (৳)
              </Label>
              <Input
                id="wallet-amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary border-border text-foreground"
                data-ocid="wallet.input"
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <Label className="text-sm text-muted-foreground block mb-2">
                পেমেন্ট পদ্ধতি বেছে নিন
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id);
                      setError("");
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                      paymentMethod === m.id
                        ? "border-neon-teal bg-neon-teal/10"
                        : "border-border bg-secondary/50 hover:border-border/80"
                    }`}
                  >
                    {m.logo ? (
                      <img
                        src={m.logo}
                        alt={m.label}
                        className="w-10 h-10 rounded-lg object-contain"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: m.color }}
                      >
                        <CreditCard size={20} className="text-white" />
                      </div>
                    )}
                    <span
                      className="text-xs font-bold leading-tight text-center"
                      style={{
                        color: paymentMethod === m.id ? "white" : "#aaa",
                      }}
                    >
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Form based on selected method */}
            {paymentMethod === "card" ? (
              <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={16} className="text-neon-teal" />
                  <span className="text-sm font-display font-bold">
                    কার্ডের তথ্য
                  </span>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    কার্ড নম্বর
                  </Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    className="bg-secondary border-border mt-1 h-10 font-mono text-sm"
                    data-ocid="wallet.input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      মেয়াদ (MM/YY)
                    </Label>
                    <Input
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) =>
                        setCardExpiry(formatExpiry(e.target.value))
                      }
                      className="bg-secondary border-border mt-1 h-10 font-mono text-sm"
                      data-ocid="wallet.input"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">CVC</Label>
                    <Input
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) =>
                        setCardCvc(
                          e.target.value.replace(/\D/g, "").slice(0, 4),
                        )
                      }
                      className="bg-secondary border-border mt-1 h-10 font-mono text-sm"
                      data-ocid="wallet.input"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    কার্ডধারীর নাম
                  </Label>
                  <Input
                    placeholder="নাম লিখুন"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="bg-secondary border-border mt-1 h-10"
                    data-ocid="wallet.input"
                  />
                </div>
              </div>
            ) : paymentMethod === "usdt" ? (
              <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="/assets/generated/usdt-logo-transparent.dim_200x200.png"
                    alt="USDT"
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-sm font-bold">
                    USDT (TRC-20) দিয়ে জমা
                  </span>
                </div>
                <div className="bg-black/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    আমাদের USDT ঠিকানায় পাঠান:
                  </p>
                  <p className="font-mono text-xs text-neon-teal break-all select-all">
                    TRX_WALLET_ADDRESS_HERE
                  </p>
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ শুধুমাত্র TRC-20 নেটওয়ার্ক
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    আপনার ওয়ালেট ঠিকানা
                  </Label>
                  <Input
                    placeholder="আপনার USDT ওয়ালেট ঠিকানা"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="bg-secondary border-border mt-1 h-10 font-mono text-xs"
                    data-ocid="wallet.input"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    ট্রানজেকশন হ্যাশ (TxID)
                  </Label>
                  <Input
                    placeholder="ট্রানজেকশন আইডি দিন"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="bg-secondary border-border mt-1 h-10 font-mono text-xs"
                    data-ocid="wallet.input"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-secondary/60 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={selectedMethod.logo}
                    alt={selectedMethod.label}
                    className="w-6 h-6 rounded"
                  />
                  <span
                    className="text-sm font-bold"
                    style={{ color: selectedMethod.color }}
                  >
                    {selectedMethod.label} দিয়ে জমা
                  </span>
                </div>
                <div className="bg-black/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    নিচের নম্বরে {selectedMethod.label} সেন্ড মানি করুন:
                  </p>
                  <p
                    className="font-mono text-lg font-bold"
                    style={{ color: selectedMethod.color }}
                  >
                    01XXXXXXXXXX
                  </p>
                  <p className="text-xs text-yellow-400 mt-1">
                    ⚠️ Send Money (ব্যক্তিগত) করুন
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    আপনার {selectedMethod.label} নম্বর
                  </Label>
                  <Input
                    placeholder="01XXXXXXXXXX"
                    value={mobileNumber}
                    onChange={(e) =>
                      setMobileNumber(
                        e.target.value.replace(/\D/g, "").slice(0, 11),
                      )
                    }
                    className="bg-secondary border-border mt-1 h-10 font-mono text-sm"
                    data-ocid="wallet.input"
                    type="tel"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    ট্রানজেকশন আইডি
                  </Label>
                  <Input
                    placeholder="ট্রানজেকশন আইডি / রেফারেন্স নম্বর"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="bg-secondary border-border mt-1 h-10 font-mono text-sm"
                    data-ocid="wallet.input"
                  />
                </div>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive text-sm"
                  data-ocid="wallet.error_state"
                >
                  {error}
                </motion.p>
              )}
              {successMsg && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-neon-green text-sm"
                  data-ocid="wallet.success_state"
                >
                  {successMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-ocid="wallet.cancel_button"
              >
                <X size={16} className="mr-1" />
                {t(lang, "cancel")}
              </Button>
              <Button
                onClick={handleAction}
                disabled={isProcessing}
                className="flex-1 font-bold bg-neon-green text-background neon-glow-green"
                data-ocid="wallet.confirm_button"
              >
                {isProcessing ? (
                  <Loader2 size={16} className="animate-spin mr-1" />
                ) : (
                  <TrendingUp size={16} className="mr-1" />
                )}
                {isProcessing ? "প্রক্রিয়া হচ্ছে..." : t(lang, "confirm")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="wallet-withdraw"
                className="text-sm text-muted-foreground block mb-1"
              >
                {t(lang, "amount")} (৳)
              </Label>
              <Input
                id="wallet-withdraw"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-secondary border-border text-foreground"
                data-ocid="wallet.input"
                onKeyDown={(e) => e.key === "Enter" && handleAction()}
              />
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-destructive text-sm"
                  data-ocid="wallet.error_state"
                >
                  {error}
                </motion.p>
              )}
              {successMsg && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-neon-green text-sm"
                  data-ocid="wallet.success_state"
                >
                  {successMsg}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-ocid="wallet.cancel_button"
              >
                <X size={16} className="mr-1" />
                {t(lang, "cancel")}
              </Button>
              <Button
                onClick={handleAction}
                className="flex-1 font-bold bg-neon-orange text-background neon-glow-orange"
                data-ocid="wallet.confirm_button"
              >
                <TrendingDown size={16} className="mr-1" />
                {t(lang, "confirm")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
