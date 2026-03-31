import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface PhotoViewerProps {
  open: boolean;
  onClose: () => void;
}

export default function PhotoViewer({ open, onClose }: PhotoViewerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          data-ocid="photo_viewer.modal"
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

          {/* Image container */}
          <motion.div
            className="relative z-10 max-w-sm w-full mx-4"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/assets/generated/kfc_night_portrait.dim_800x1000.jpg"
              alt="KFC Night Portrait"
              className="w-full rounded-2xl shadow-2xl"
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute -top-3 -right-3 rounded-full shadow-lg"
              onClick={onClose}
              data-ocid="photo_viewer.close_button"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
