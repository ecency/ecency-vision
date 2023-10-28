import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import React, { useEffect, useState } from "react";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import { getMetaProps } from "../util/get-meta-props";
import NavBar from "../components/navbar";
import { makeGroupKey } from "../store/entries";
import { connect } from "react-redux";
import { withPersistentScroll } from "../components/with-persistent-scroll";
import loadable from "@loadable/component";
import { useMappedStore } from "../store/use-mapped-store";

const LandingPage = loadable(() => import("../components/landing-page"));
const EntryIndexContainer = loadable(() => import("./entry-index"));

const Index = (props: PageProps) => {
  const [step, setStep] = useState(1);
  const [metaProps, setMetaProps] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [showEntryPage, setShowEntryPage] = useState(false);
  const store = useMappedStore();

  useEffect(() => {
    setTimeout(() => moveToSection(props.location.hash), 1000);

    return () => {
      store.setLastIndexPath(showLandingPage ? "landing" : "feed");
    };
  }, [showEntryPage, showLandingPage]);

  useEffect(() => {
    initStep(store.activeUser ? 2 : 1);
    if (store.global.usePrivate && !store.activeUser && props.location.search === "?login") {
      store.toggleUIProp("login");
    }
  }, [store.activeUser, props.location.pathname]);

  const reload = () => {
    const { global, fetchEntries, invalidateEntries } = store;
    invalidateEntries(makeGroupKey(global.filter, global.tag));
    fetchEntries(global.filter, global.tag, false);
  };

  const setNewStep = (step: number) => {
    store.setLastIndexPath(null);
    setStep(step);
    initStep(step);
  };

  const moveToSection = (hash?: string) => {
    if (!hash) {
      return;
    }
    document.querySelector(hash)?.scrollIntoView();
  };

  const initStep = (nextStep?: number) => {
    let currentStep = nextStep || step;
    if (store.global.lastIndexPath === "landing" && store.activeUser === null) {
      currentStep = 1;
    } else if (store.global.lastIndexPath === "feed" && store.activeUser === null) {
      currentStep = 2;
    }

    const nextShowLandingPage =
      currentStep === 1 &&
      store.activeUser === null &&
      props.location &&
      "/" === props.location?.pathname;
    const nextShowEntryPage =
      currentStep === 2 ||
      props.location?.pathname?.startsWith("/@") ||
      props.location?.pathname?.startsWith("/hot") ||
      props.location?.pathname?.startsWith("/created") ||
      props.location?.pathname?.startsWith("/trending") ||
      props.location?.pathname?.startsWith("/payout") ||
      props.location?.pathname?.startsWith("/payout_comments") ||
      props.location?.pathname?.startsWith("/rising") ||
      props.location?.pathname?.startsWith("/purchase") ||
      props.location?.pathname?.startsWith("/promoted") ||
      props.location?.pathname?.startsWith("/controversial");

    if (showLandingPage !== nextShowLandingPage) {
      setShowLandingPage(nextShowLandingPage);
    }

    if (showEntryPage !== nextShowEntryPage) {
      setShowEntryPage(nextShowEntryPage);
    }

    setMetaProps(getMetaProps(store));
  };

  return (
    <>
      <Meta {...metaProps} />
      <ScrollToTop />
      <Theme global={store.global} />
      <Feedback activeUser={store.activeUser} />
      <NavBar
        history={props.history}
        step={step}
        setStepOne={() => setNewStep(1)}
        setStepTwo={() => setNewStep(2)}
      />
      {showLandingPage && (
        <LandingPage {...props} loading={loading} setLoading={setLoading} setStep={setNewStep} />
      )}
      {showEntryPage && (
        <EntryIndexContainer {...props} loading={loading} setLoading={setLoading} reload={reload} />
      )}
    </>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(withPersistentScroll(Index));
