"use client";

import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

import { EntityAvatar } from "@/components/ui/entity-avatar";
import { cn } from "@/lib/utils";

/**
 * A clickable avatar that opens a large image preview (lightbox) when it has a
 * photo. When there's no photo it shows the gradient-initials avatar enlarged.
 * Used in tables/profiles — the trigger shows a pointer cursor.
 */
export function AvatarPreview({
  name,
  src,
  className,
  triggerClassName,
}: {
  name?: string | null;
  src?: string | null;
  className?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label={`Preview ${name ?? "avatar"}`}
        className={cn(
          "cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
          triggerClassName,
        )}
      >
        <EntityAvatar name={name} src={src} className={className} />
      </button>

      <Lightbox open={open} onClose={() => setOpen(false)}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={name ?? ""}
            className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain shadow-2xl"
          />
        ) : (
          <EntityAvatar name={name} src={null} className="size-48 rounded-3xl" textClassName="text-5xl" />
        )}
      </Lightbox>
    </>
  );
}

function Lightbox({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute top-5 right-5 rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25"
          >
            <X className="size-5" />
          </button>
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
