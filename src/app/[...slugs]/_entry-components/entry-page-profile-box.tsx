"use client";

import { useGlobalStore } from "@/core/global-store";
import { Entry } from "@/entities";
import { AuthorInfoCard } from "@/app/[...slugs]/_entry-components/author-info-card";
import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";
import { AnimatePresence } from "framer-motion";

interface Props {
  entry: Entry;
}

export function EntryPageProfileBox({ entry }: Props): JSX.Element {
  const isMobile = useGlobalStore((s) => s.isMobile);
  const { showProfileBox } = EcencyClientServerBridge.useSafeContext(EntryPageContext);

  return !isMobile ? (
    <div
      id="avatar-fixed-container"
      className="invisible sticky top-[8rem] translate-x-[calc(-100%-2rem)] max-w-[180px]"
    >
      <AnimatePresence>{showProfileBox && <AuthorInfoCard entry={entry} />}</AnimatePresence>
    </div>
  ) : (
    <></>
  );
}
