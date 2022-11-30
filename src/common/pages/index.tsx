import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import React, { useEffect, useState } from "react";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBarElectron from "../../desktop/app/components/navbar";
import { getMetaProps } from "../util/get-meta-props";
import NavBar from "../components/navbar";
import { makeGroupKey } from "../store/entries";
import { connect } from "react-redux";
import { withPersistentScroll } from "../components/with-persistent-scroll";
import loadable from "@loadable/component";

const LandingPage = loadable(() => import("../components/landing-page"));
const EntryIndexContainer = loadable(() => import("./entry-index"));

const Index = (props: PageProps) => {
  const [step, setStep] = useState(1);
  const [metaProps, setMetaProps] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [showEntryPage, setShowEntryPage] = useState(false);

  useEffect(() => {
    setTimeout(() => moveToSection(props.location.hash), 1000);

    return () => {
      props.setLastIndexPath(showLandingPage ? "landing" : "feed");
    };
  }, [showEntryPage, showLandingPage]);

  useEffect(() => {
    initStep(props.activeUser ? 2 : 1);
    if (props.global.usePrivate && !props.activeUser && props.location.search === "?login") {
      props.toggleUIProp("login");
    }
  }, [props.activeUser, props.location.pathname]);

  const reload = () => {
    const { global, fetchEntries, invalidateEntries } = props;
    invalidateEntries(makeGroupKey(global.filter, global.tag));
    fetchEntries(global.filter, global.tag, false);
  };

  const setNewStep = (step: number) => {
    props.setLastIndexPath(null);
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
    if (props.global.lastIndexPath === "landing" && props.activeUser === null) {
      currentStep = 1;
    } else if (props.global.lastIndexPath === "feed" && props.activeUser === null) {
      currentStep = 2;
    }

    const nextShowLandingPage =
      currentStep === 1 &&
      props.activeUser === null &&
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

    setMetaProps(getMetaProps(props));
  };

  return (
    <>
      <Meta {...metaProps} />
      <ScrollToTop />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      {props.global.isElectron
        ? NavBarElectron({
            ...props,
            reloadFn: reload,
            reloading: loading,
            step,
            setStepTwo: () => setNewStep(2)
          })
        : NavBar({
            ...props,
            step,
            setStepOne: () => setNewStep(1),
            setStepTwo: () => setNewStep(2)
          })}
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
