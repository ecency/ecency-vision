"use client";

import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

export function CommunityListItemAnimatedLayout(props: PropsWithChildren<{ i: number }>) {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      exit={{
        opacity: 0
      }}
      transition={{
        duration: 0.6,
        type: "spring"
      }}
    >
      {props.children}
    </motion.div>
  );
}
