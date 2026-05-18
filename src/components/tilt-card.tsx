"use client";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  intensity?: number;
}

/**
 * Subtle 3D tilt on hover + in-view fade. Ported from OraxAI but toned down
 * (max tilt 6deg vs 12) so it feels premium, not gimmicky.
 */
export function TiltCard({ children, delay = 0, className, intensity = 6 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const spring = { stiffness: 180, damping: 18, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), spring);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <div
        ref={wrapRef}
        style={{ perspective: "1100px" }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="h-full"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="h-full"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
