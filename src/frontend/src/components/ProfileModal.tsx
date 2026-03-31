import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { getUserProfile, updateUserProfile } from "../lib/auth";

interface Props {
  open: boolean;
  onClose: () => void;
  identifier: string;
}

export default function ProfileModal({ open, onClose, identifier }: Props) {
  const profile = getUserProfile(identifier);

  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bkash, setBkash] = useState(profile?.bkash ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateUserProfile(identifier, { name, phone, bkash });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="bg-card border border-border max-w-sm mx-auto"
        data-ocid="profile.modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg text-primary">
            👤 প্রোফাইল
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Read-only identifier */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground font-display">
              ইমেইল / ফোন নম্বর
            </Label>
            <div className="bg-secondary border border-border rounded-md px-3 py-2 text-sm text-muted-foreground font-mono">
              {identifier}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label
              htmlFor="profile-name"
              className="text-xs text-muted-foreground font-display"
            >
              নাম
            </Label>
            <Input
              id="profile-name"
              placeholder="আপনার নাম লিখুন"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary border-border h-10"
              data-ocid="profile.input"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label
              htmlFor="profile-phone"
              className="text-xs text-muted-foreground font-display"
            >
              ফোন নম্বর
            </Label>
            <Input
              id="profile-phone"
              placeholder="01XXXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-secondary border-border h-10"
              data-ocid="profile.input"
            />
          </div>

          {/* bKash */}
          <div className="space-y-1">
            <Label
              htmlFor="profile-bkash"
              className="text-xs text-muted-foreground font-display"
            >
              বিকাশ নম্বর
            </Label>
            <Input
              id="profile-bkash"
              placeholder="বিকাশ নম্বর"
              value={bkash}
              onChange={(e) => setBkash(e.target.value)}
              className="bg-secondary border-border h-10"
              data-ocid="profile.input"
            />
          </div>

          {saved && (
            <p
              className="text-green-400 text-sm text-center font-display"
              data-ocid="profile.success_state"
            >
              ✅ সংরক্ষিত হয়েছে!
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSave}
              className="flex-1 bg-primary font-display font-bold"
              data-ocid="profile.save_button"
            >
              সংরক্ষণ করুন
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 font-display"
              data-ocid="profile.close_button"
            >
              বন্ধ করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
