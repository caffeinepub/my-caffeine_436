import { useEffect, useRef, useState } from "react";

const BENGALI_NAMES = [
  "রাহেলা",
  "করিম",
  "সুমাইয়া",
  "তানভীর",
  "নাজনীন",
  "আরিফ",
  "মিম",
  "সজীব",
  "রিতু",
  "মামুন",
  "পলি",
  "শাকিল",
  "দিপু",
  "লামিয়া",
  "হাসান",
  "রুবেল",
  "সানিয়া",
  "ইমরান",
  "মৌ",
  "রাকিব",
  "সোহাগ",
  "তামান্না",
  "নিলুফার",
  "জিসান",
  "মুন্নি",
  "বাবু",
  "সেলিম",
  "রেজা",
  "ফারিয়া",
  "কাউসার",
];

const AMOUNTS = [500, 1000, 1200, 1500, 2000, 5000];

const PHONE_SUFFIXES = [
  "01711***456",
  "01812***789",
  "01912***123",
  "01533***321",
  "01611***654",
  "01719***987",
  "01855***201",
  "01993***432",
];

function generateMessages(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: BENGALI_NAMES[Math.floor(Math.random() * BENGALI_NAMES.length)],
    amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
    phone: PHONE_SUFFIXES[Math.floor(Math.random() * PHONE_SUFFIXES.length)],
  }));
}

type TickerItem = { id: number; name: string; amount: number; phone: string };

export default function WithdrawTicker() {
  const [messages] = useState(() => generateMessages(20));
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;
    let pos = 0;
    const speed = 0.5;
    let animId = 0;
    const animate = () => {
      pos -= speed;
      if (-pos >= ticker.scrollWidth / 2) {
        pos = 0;
      }
      ticker.style.transform = `translateX(${pos}px)`;
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const items: TickerItem[] = [...messages, ...messages];

  return (
    <div className="w-full overflow-hidden bg-green-900/30 border border-green-500/20 rounded-xl py-2 px-0">
      <div className="flex items-center gap-2 px-3 mb-0.5">
        <span className="text-green-400 text-xs font-bold whitespace-nowrap">
          💸 লাইভ উইথড্র:
        </span>
      </div>
      <div className="overflow-hidden relative">
        <div
          ref={tickerRef}
          className="flex gap-6 will-change-transform whitespace-nowrap"
        >
          {items.map((msg, i) => {
            const key = `ticker-${i}`;
            return (
              <span
                key={key}
                className="text-xs text-green-300 shrink-0 inline-flex items-center gap-1"
              >
                <span className="text-yellow-400">✅</span>
                <span className="font-bold text-white">{msg.name}</span>
                <span className="text-muted-foreground">({msg.phone})</span>
                <span className="text-green-400 font-bold">৳{msg.amount}</span>
                <span className="text-green-300">উইথড্র সফল</span>
                <span className="text-gray-500 mx-2">•</span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
