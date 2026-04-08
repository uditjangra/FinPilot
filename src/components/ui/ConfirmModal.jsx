import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const MotionDiv = motion.div;

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  tone = "danger",
}) {
  const buttonClass =
    tone === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MotionDiv
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500">{description}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" className="btn-secondary px-4 py-2" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button type="button" className={`rounded-xl px-4 py-2 text-sm font-semibold ${buttonClass}`} onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}
