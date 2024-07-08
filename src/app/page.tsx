"use client";

import { useCallback, useEffect, useState } from "react";
import { useGlobalStore } from "@/core/global-store";
import { getMetaProps } from "@/utils";
import { Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";
import { EntryIndex } from "@/app/_components";
import { usePathname } from "next/navigation";

export default function Home() {
  const pathname = usePathname();

  const activeUser = useGlobalStore((s) => s.activeUser);
  const setLastIndexPath = useGlobalStore((s) => s.setLastIndexPath);
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);
  const lastIndexPath = useGlobalStore((s) => s.lastIndexPath);
  const filter = useGlobalStore((s) => s.filter);
  const tag = useGlobalStore((s) => s.tag);

  const [step, setStep] = useState(1);
  const [metaProps, setMetaProps] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [showEntryPage, setShowEntryPage] = useState(false);

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

  useEffect(() => {
    console.log(showEntryPage);
  }, [showEntryPage]);

  return (
    <>
      {/*<Meta {...metaProps} />*/}
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />
      <EntryIndex loading={loading} setLoading={setLoading} />
      {/*{showEntryPage && }*/}
      {/*{showLandingPage && (*/}
      {/*  <LandingPage loading={loading} setLoading={setLoading} setStep={setNewStep} />*/}
      {/*)}*/}
    </>
  );
}
