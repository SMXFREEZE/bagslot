"use client";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delay?: number;
  from?: "bottom" | "top" | "left" | "right" | "none";
  className?: string;
  initial?: boolean; // if true, animate on mount (hero); false → only on view
}

const offsets = {
  bottom: { y: 24 },
  top: { y: -24 },
  left: { x: -24 },
  right: { x: 24 },
  none: {},
};

export function FadeIn({ children, delay = 0, from = "bottom", className, initial = true }: Props) {
  const off = offsets[from];
  if (initial) {
    return (
      <motion.div
        initial={{ opacity: 0, ...off }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, ...off }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
