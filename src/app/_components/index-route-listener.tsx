"use client";

import { useGlobalStore } from "@/core/global-store";
import { useCallback, useEffect } from "react";
import { getMetaProps } from "@/utils";
import { usePathname, useRouter } from "next/navigation";

export function IndexRouteListener() {
  const pathname = usePathname();
  const router = useRouter();

  const activeUser = useGlobalStore((s) => s.activeUser);
  const setLastIndexPath = useGlobalStore((s) => s.setLastIndexPath);
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);
  const lastIndexPath = useGlobalStore((s) => s.lastIndexPath);
  const filter = useGlobalStore((s) => s.filter);
  const tag = useGlobalStore((s) => s.tag);

  const setNewStep = (step: number) => {
    setLastIndexPath(null);
    setStep(step);
    initStep(step);
  };

  const moveToSection = (hash?: string) => {
    if (!hash) {
      return;
    }
    document.querySelector(hash)?.scrollIntoView();
  };

  const initStep = useCallback(
    (nextStep?: number) => {
      let currentStep = nextStep || step;
      if (lastIndexPath === "landing" && activeUser === null) {
        currentStep = 1;
      } else if (lastIndexPath === "feed" && activeUser === null) {
        currentStep = 2;
      }

      const nextShowLandingPage = currentStep === 1 && activeUser === null && "/" === pathname;

      setShowLandingPage(nextShowLandingPage);
      setShowEntryPage(!nextShowLandingPage);

      setMetaProps(getMetaProps({ activeUser, filter, tag }));
    },
    [activeUser, filter, lastIndexPath, pathname, step, tag]
  );

  useEffect(() => {
    setTimeout(() => moveToSection(location.hash), 1000);

    return () => {
      setLastIndexPath(showLandingPage ? "landing" : "feed");
    };
  }, [setLastIndexPath, showEntryPage, showLandingPage]);

  useEffect(() => {
    initStep(activeUser ? 2 : 1);
    if (usePrivate && !activeUser && location.search === "?login") {
      toggleUIProp("login");
    }
  }, [activeUser, initStep, toggleUIProp, usePrivate]);

  return <></>;
}
