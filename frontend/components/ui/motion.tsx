"use client";

import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import React from "react";

export { AnimatePresence };

const defaultTransition = {
  duration: 0.16, // 160ms standard transition
  ease: [0.25, 0.8, 0.25, 1] as [number, number, number, number], // strongly-typed easeOut bezier tuple
};

export interface MotionBoxProps extends HTMLMotionProps<"div"> {
  children?: React.ReactNode;
}

export const MotionBox = React.forwardRef<HTMLDivElement, MotionBoxProps>(
  ({ transition, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        transition={{ ...defaultTransition, ...transition }}
        {...props}
      />
    );
  }
);
MotionBox.displayName = "MotionBox";

// Presets
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};

export const hoverScale = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.99 },
};
