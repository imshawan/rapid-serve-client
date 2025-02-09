"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface FadeInWhenVisibleProps {
  children: React.ReactNode;
  delay?: number;
}

export function FadeInWhenVisible({ children, delay = 0 }: FadeInWhenVisibleProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}