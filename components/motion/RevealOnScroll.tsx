"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeInUp } from "./variants";

export function RevealOnScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeInUp}
    >
      {children}
    </motion.div>
  );
}
