import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { getUserProfile, updateUserProfile } from "../lib/auth";

interface Props {
  open: boolean;
  onClose: () => void;
  identifier: string;
  onPhotoChange?: (photo: string) => void;
}

export default function ProfileModal({
  open,
  onClose,
  identifier,
  onPhotoChange,
}: Props) {
  const profile = getUserProfile(identifier);

  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bkash, setBkash] = useState(profile?.bkash ?? "");
  const [photo, setPhoto] = useState<string>(profile?.photo ?? "");
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("শুধু ছবি ফাইল গ্রহণযোগ্য।");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("ছবির সাইজ ২ MB এর বেশি হবে না।");
      return;
    }
    setPhotoError("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // Resize/compress to 200x200
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext("2d")!;
        // Crop to square
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        setPhoto(compressed);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = () => {
    updateUserProfile(identifier, { name, phone, bkash, photo });
    onPhotoChange?.(photo);
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
          {/* Profile Photo */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {photo ? (
                <img
                  src={photo}
                  alt="প্রোফাইল ফটো"
                  className="w-24 h-24 rounded-full object-cover border-2 border-primary/50 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                  <Camera size={28} className="text-muted-foreground" />
                </div>
              )}
              {photo && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute -top-1 -right-1 bg-destructive rounded-full p-1 hover:bg-destructive/80 transition-colors"
                  title="ফটো মুছুন"
                >
                  <Trash2 size={12} className="text-white" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="font-display text-xs border-primary/50 text-primary"
                data-ocid="profile.photo_upload_button"
              >
                <Upload size={14} className="mr-1" />
                {photo ? "ফটো পরিবর্তন" : "ফটো আপলোড"}
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handlePhotoChange}
            />
            {photoError && (
              <p className="text-red-400 text-xs text-center">{photoError}</p>
            )}
          </div>

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
