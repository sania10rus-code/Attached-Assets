import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { useTranslation } from "@/i18n";

export default function Splash({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tm = window.setTimeout(() => setVisible(false), 2000);
    return () => window.clearTimeout(tm);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: "#0b0e14" }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-3">
              <Zap size={48} className="text-primary" strokeWidth={2.5} fill="currentColor" />
              <span className="text-5xl font-bold tracking-tight text-white text-glow">
                {t("common.brand")}
              </span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-sm text-muted-foreground tracking-wider uppercase font-mono"
            >
              {t("splash.tagline")}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
