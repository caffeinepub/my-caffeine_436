export type Lang = "bengali" | "english";

export const t = (lang: Lang, key: string): string => {
  const translations: Record<string, Record<Lang, string>> = {
    appTitle: { bengali: "কুইজ গেম", english: "Quiz Game" },
    appSubtitle: { bengali: "জ্ঞান পরীক্ষা করুন!", english: "Test Your Knowledge!" },
    langToggle: { bengali: "English", english: "বাংলা" },
    selectCategory: { bengali: "ক্যাটাগরি বেছে নিন", english: "Select Category" },
    startQuiz: { bengali: "কুইজ শুরু করুন", english: "Start Quiz" },
    leaderboard: { bengali: "লিডারবোর্ড", english: "Leaderboard" },
    admin: { bengali: "অ্যাডমিন", english: "Admin" },
    wallet: { bengali: "ওয়ালেট", english: "Wallet" },
    balance: { bengali: "ব্যালেন্স", english: "Balance" },
    deposit: { bengali: "জমা করুন", english: "Deposit" },
    withdraw: { bengali: "উত্তোলন", english: "Withdraw" },
    txHistory: { bengali: "লেনদেন ইতিহাস", english: "Transaction History" },
    amount: { bengali: "পরিমাণ", english: "Amount" },
    confirm: { bengali: "নিশ্চিত করুন", english: "Confirm" },
    cancel: { bengali: "বাতিল", english: "Cancel" },
    insufficientBalance: {
      bengali: "অপর্যাপ্ত ব্যালেন্স",
      english: "Insufficient balance",
    },
    question: { bengali: "প্রশ্ন", english: "Question" },
    score: { bengali: "স্কোর", english: "Score" },
    timeLeft: { bengali: "সময় বাকি", english: "Time Left" },
    correct: { bengali: "সঠিক!", english: "Correct!" },
    wrong: { bengali: "ভুল!", english: "Wrong!" },
    timeUp: { bengali: "সময় শেষ!", english: "Time's Up!" },
    results: { bengali: "ফলাফল", english: "Results" },
    excellent: { bengali: "অসাধারণ! 🎉", english: "Excellent! 🎉" },
    good: { bengali: "ভালো! 👏", english: "Good! 👏" },
    tryAgain: { bengali: "আবার চেষ্টা করুন 💪", english: "Try Again 💪" },
    yourName: { bengali: "আপনার নাম লিখুন", english: "Enter Your Name" },
    submitScore: { bengali: "স্কোর জমা দিন", english: "Submit Score" },
    playAgain: { bengali: "আবার খেলুন", english: "Play Again" },
    home: { bengali: "হোম", english: "Home" },
    rank: { bengali: "র‌্যাংক", english: "Rank" },
    name: { bengali: "নাম", english: "Name" },
    category: { bengali: "ক্যাটাগরি", english: "Category" },
    all: { bengali: "সব", english: "All" },
    adminPanel: { bengali: "অ্যাডমিন প্যানেল", english: "Admin Panel" },
    password: { bengali: "পাসওয়ার্ড", english: "Password" },
    login: { bengali: "লগইন", english: "Login" },
    addQuestion: { bengali: "প্রশ্ন যোগ করুন", english: "Add Question" },
    editQuestion: { bengali: "প্রশ্ন সম্পাদনা", english: "Edit Question" },
    deleteQuestion: { bengali: "প্রশ্ন মুছুন", english: "Delete Question" },
    questionText: { bengali: "প্রশ্নের টেক্সট", english: "Question Text" },
    options: { bengali: "অপশনসমূহ", english: "Options" },
    correctAnswer: { bengali: "সঠিক উত্তর", english: "Correct Answer" },
    difficulty: { bengali: "কঠিনতা", english: "Difficulty" },
    language: { bengali: "ভাষা", english: "Language" },
    save: { bengali: "সংরক্ষণ করুন", english: "Save" },
    noQuestions: {
      bengali: "কোনো প্রশ্ন নেই",
      english: "No questions available",
    },
    loading: { bengali: "লোড হচ্ছে...", english: "Loading..." },
    generalKnowledge: { bengali: "সাধারণ জ্ঞান", english: "General Knowledge" },
    science: { bengali: "বিজ্ঞান", english: "Science" },
    historyCategory: { bengali: "ইতিহাস", english: "History" },
    sports: { bengali: "খেলাধুলা", english: "Sports" },
    easy: { bengali: "সহজ", english: "Easy" },
    medium: { bengali: "মাঝারি", english: "Medium" },
    hard: { bengali: "কঠিন", english: "Hard" },
    bengaliLang: { bengali: "বাংলা", english: "Bengali" },
    englishLang: { bengali: "ইংরেজি", english: "English" },
    yourRank: { bengali: "আপনার র‌্যাংক", english: "Your Rank" },
    viewLeaderboard: { bengali: "লিডারবোর্ড দেখুন", english: "View Leaderboard" },
    close: { bengali: "বন্ধ করুন", english: "Close" },
    depositSuccess: {
      bengali: "সফলভাবে জমা হয়েছে",
      english: "Deposited successfully",
    },
    withdrawSuccess: {
      bengali: "সফলভাবে উত্তোলন হয়েছে",
      english: "Withdrawn successfully",
    },
    invalidAmount: { bengali: "অবৈধ পরিমাণ", english: "Invalid amount" },
    noTransactions: {
      bengali: "কোনো লেনদেন নেই",
      english: "No transactions yet",
    },
    wrongPassword: { bengali: "ভুল পাসওয়ার্ড", english: "Wrong password" },
    edit: { bengali: "সম্পাদনা", english: "Edit" },
    delete: { bengali: "মুছুন", english: "Delete" },
    back: { bengali: "পিছনে", english: "Back" },
    logout: { bengali: "লগআউট", english: "Logout" },
  };
  return translations[key]?.[lang] ?? key;
};

export const CATEGORIES = [
  {
    key: "General Knowledge",
    icon: "🧠",
    colorClass: "from-teal-500 to-cyan-600",
  },
  { key: "Science", icon: "🔬", colorClass: "from-orange-400 to-amber-500" },
  { key: "History", icon: "📜", colorClass: "from-pink-500 to-rose-600" },
  { key: "Sports", icon: "⚽", colorClass: "from-green-500 to-emerald-600" },
] as const;

export const getCategoryLabel = (lang: Lang, category: string): string => {
  const map: Record<string, string> = {
    "General Knowledge": t(lang, "generalKnowledge"),
    Science: t(lang, "science"),
    History: t(lang, "historyCategory"),
    Sports: t(lang, "sports"),
  };
  return map[category] ?? category;
};
