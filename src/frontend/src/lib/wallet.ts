export interface Transaction {
  id: string;
  type: "deposit" | "withdraw";
  amount: number;
  timestamp: number;
}

const BALANCE_KEY = "quizWallet";
const TX_KEY = "quizTransactions";

export function getBalance(): number {
  const raw = localStorage.getItem(BALANCE_KEY);
  return raw ? Number.parseFloat(raw) : 0;
}

export function setBalance(amount: number): void {
  localStorage.setItem(BALANCE_KEY, amount.toFixed(2));
}

export function getTransactions(): Transaction[] {
  const raw = localStorage.getItem(TX_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addTransaction(
  type: "deposit" | "withdraw",
  amount: number,
): void {
  const txs = getTransactions();
  txs.unshift({
    id: Date.now().toString(),
    type,
    amount,
    timestamp: Date.now(),
  });
  localStorage.setItem(TX_KEY, JSON.stringify(txs.slice(0, 50)));
}

export function deposit(amount: number): { success: boolean; error?: string } {
  if (!amount || amount <= 0) return { success: false, error: "invalidAmount" };
  const balance = getBalance();
  setBalance(balance + amount);
  addTransaction("deposit", amount);
  return { success: true };
}

export function withdraw(amount: number): { success: boolean; error?: string } {
  if (!amount || amount <= 0) return { success: false, error: "invalidAmount" };
  const balance = getBalance();
  if (amount > balance) return { success: false, error: "insufficientBalance" };
  setBalance(balance - amount);
  addTransaction("withdraw", amount);
  return { success: true };
}
