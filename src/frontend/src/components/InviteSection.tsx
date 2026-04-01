import { Button } from "@/components/ui/button";
import { Check, Copy, Loader2, Share2, UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function InviteSection() {
  const [copied, setCopied] = useState(false);
  const [shortLink, setShortLink] = useState("");
  const [loadingLink, setLoadingLink] = useState(true);
  const originalUrl = window.location.origin;

  useEffect(() => {
    const cached = localStorage.getItem("quiz_short_link");
    if (cached) {
      setShortLink(cached);
      setLoadingLink(false);
      return;
    }

    // Use is.gd URL shortener (free, no API key, CORS-friendly)
    fetch(
      `https://is.gd/create.php?format=json&url=${encodeURIComponent(originalUrl)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.shorturl) {
          setShortLink(data.shorturl);
          localStorage.setItem("quiz_short_link", data.shorturl);
        } else {
          setShortLink(originalUrl);
        }
      })
      .catch(() => {
        // Fallback: try TinyURL
        fetch(
          `https://tinyurl.com/api-create.php?url=${encodeURIComponent(originalUrl)}`,
        )
          .then((res) => res.text())
          .then((url) => {
            if (url.startsWith("http")) {
              setShortLink(url.trim());
              localStorage.setItem("quiz_short_link", url.trim());
            } else {
              setShortLink(originalUrl);
            }
          })
          .catch(() => setShortLink(originalUrl));
      })
      .finally(() => setLoadingLink(false));
  }, [originalUrl]);

  const linkToUse = shortLink || originalUrl;

  const handleShare = async () => {
    const text = `🎮 কুইজ গেম খেলুন এবং পুরস্কার জিতুন!\n👉 ${linkToUse}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "কুইজ গেম",
          text: "এখনই খেলুন এবং পুরস্কার জিতুন! 🎮",
          url: linkToUse,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("লিংক কপি হয়েছে!");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(linkToUse);
    setCopied(true);
    toast.success("শর্ট লিংক কপি হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full max-w-md mt-6"
      data-ocid="invite.section"
    >
      <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-5">
        <h2 className="font-display text-sm font-bold mb-1 text-yellow-400 uppercase tracking-wider">
          🎁 বন্ধুকে আমন্ত্রণ করুন
        </h2>
        <p className="text-xs text-yellow-100/70 mb-4">
          বন্ধু রেজিস্ট্রেশন করলে আপনি পাবেন{" "}
          <span className="text-yellow-300 font-bold">৳৫০</span>
        </p>

        {/* Short Link Box */}
        <div className="flex items-center gap-2 mb-1 bg-background/40 border border-yellow-500/20 rounded-xl px-3 py-2">
          {loadingLink ? (
            <div className="flex-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 size={12} className="animate-spin" />
              শর্ট লিংক তৈরি হচ্ছে...
            </div>
          ) : (
            <p className="flex-1 text-xs text-yellow-300 truncate font-mono font-semibold">
              {linkToUse}
            </p>
          )}
          <button
            type="button"
            onClick={handleCopy}
            disabled={loadingLink}
            className="text-yellow-400 hover:text-yellow-300 transition-colors flex-shrink-0 disabled:opacity-40"
            title="লিংক কপি করুন"
            data-ocid="invite.button"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mb-4 pl-1">
          ✅ is.gd সার্ভিস দিয়ে শর্ট লিংক তৈরি হয়েছে
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            disabled={loadingLink}
            className="flex-1 border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10 font-display text-xs"
            data-ocid="invite.secondary_button"
          >
            <Copy size={14} className="mr-1" />
            লিংক কপি
          </Button>
          <Button
            onClick={handleShare}
            size="sm"
            disabled={loadingLink}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-background font-display font-bold text-xs hover:from-yellow-400 hover:to-orange-400"
            data-ocid="invite.primary_button"
          >
            <UserPlus size={14} className="mr-1" />
            বন্ধুকে ইনভাইট করুন
          </Button>
        </div>

        {/* Share button */}
        <Button
          onClick={handleShare}
          variant="ghost"
          size="sm"
          disabled={loadingLink}
          className="w-full mt-2 text-xs text-muted-foreground hover:text-yellow-300 hover:bg-yellow-500/10 font-display"
          data-ocid="invite.button"
        >
          <Share2 size={14} className="mr-1" />
          শেয়ার করুন
        </Button>
      </div>
    </motion.div>
  );
}
