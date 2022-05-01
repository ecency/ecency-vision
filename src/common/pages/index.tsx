import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from './common';
import React, { useEffect, useState } from 'react';
import LandingPage from '../components/landing-page';
import EntryIndexContainer from './entry-index';
import Meta from '../components/meta';
import ScrollToTop from '../components/scroll-to-top';
import Theme from '../components/theme';
import Feedback from '../components/feedback';
import NavBarElectron from '../../desktop/app/components/navbar';
import { getMetaProps } from '../util/get-meta-props';
import NavBar from '../components/navbar';
import { makeGroupKey } from '../store/entries';
import { connect } from 'react-redux';
import { withPersistentScroll } from '../components/with-persistent-scroll';

const Index = (props: PageProps) => {
  const [step, setStep] = useState(1);
  const [metaProps, setMetaProps] = useState({});
  const [loading, setLoading] = useState(false);
  const [showLandingPage, setShowLandingPage]  = useState(true);
  const [showEntryPage, setShowEntryPage] = useState(false);

  useEffect(() => {
    const nextShowLandingPage = step === 1  &&
      props.activeUser === null &&
      props.location &&
      "/" === props.location?.pathname;
    const nextShowEntryPage = step === 2
      || props.location?.pathname?.startsWith("/hot")
      || props.location?.pathname?.startsWith("/created")
      || props.location?.pathname?.startsWith("/trending")
      || props.location?.pathname?.startsWith("/payout")
      || props.location?.pathname?.startsWith("/payout_comments")
      || props.location?.pathname?.startsWith("/rising")
      || props.location?.pathname?.startsWith("/controversial");

    if (showLandingPage !== nextShowLandingPage) {
      setShowLandingPage(nextShowLandingPage);
    }

    if (showEntryPage !== nextShowEntryPage) {
      setShowEntryPage(nextShowEntryPage);
    }

    setMetaProps(getMetaProps(props));
  }, [props.activeUser, props.location, props.global, step]);

  const reload = () => {
    const {global, fetchEntries, invalidateEntries} = props;
    invalidateEntries(makeGroupKey(global.filter, global.tag));
    fetchEntries(global.filter, global.tag, false);
  }

  return <>
    <Meta {...metaProps} />
    <ScrollToTop/>
    <Theme global={props.global}/>
    <Feedback/>
    {props.global.isElectron ?
      NavBarElectron({
        ...props,
        reloadFn: reload,
        reloading: loading,
        step,
        setStepTwo: () => setStep(2)
      }) :
      NavBar({...props, step, setStepOne: () => setStep(1), setStepTwo: () => setStep(2)})
    }
    {showLandingPage && <LandingPage {...props} loading={loading} setLoading={setLoading} setStep={setStep}/>}
    {showEntryPage && <EntryIndexContainer
        {...props}
        loading={loading}
        setLoading={setLoading}
        reload={reload}
    />}
    </>;
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(withPersistentScroll(Index));