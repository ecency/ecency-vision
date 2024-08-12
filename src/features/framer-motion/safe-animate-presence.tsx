"use client";

import { AnimatePresence, AnimatePresenceProps } from "framer-motion";
import { PropsWithChildren } from "react";

export function SafeAnimatePresence(props: PropsWithChildren<AnimatePresenceProps>) {
  return <AnimatePresence {...props} />;
}
