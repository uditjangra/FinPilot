import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const MotionDiv = motion.div;

export default function Modal({ open, title, subtitle, onClose, children, maxWidth = "max-w-xl" }) {
  return (
    <AnimatePresence>
      {open ? (
        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 px-4"
        >
          <MotionDiv
            initial={{ y: 18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            className={`max-h-[88vh] w-full overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ${maxWidth}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
              </div>
              <button type="button" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100" onClick={onClose}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5">{children}</div>
          </MotionDiv>
        </MotionDiv>
      ) : null}
    </AnimatePresence>
  );
}
