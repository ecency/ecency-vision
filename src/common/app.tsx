import React, { useEffect } from "react";
import {Route, Switch} from "react-router-dom";

import EntryIndexContainer from "./pages/entry-index";
import ProfileContainer from "./pages/profile";
import EntryContainer from "./pages/entry";
import CommunitiesContainer from "./pages/communities";
import CommunityContainer from "./pages/community";
import WitnessesContainer from "./pages/witnesses";
import {ProposalsIndexContainer, ProposalDetailContainer} from "./pages/proposals";
import AuthContainer from "./pages/auth";
import SubmitContainer from "./pages/submit";
import MarketPage from "./pages/market";
import SignUpContainer from "./pages/sign-up";
import OnboardFriend from "./components/onboard-friend";
import NotFound from "./components/404";

import Tracker from "./tracker";

import {
    AboutPageContainer,
    GuestPostPageContainer,
    ContributePageContainer,
    PrivacyPageContainer,
    WhitePaperPageContainer,
    TosPageContainer,
    FaqPageContainer,
    ContributorsPageContainer
} from "./pages/static";

import routes from "./routes";
import * as ls from './util/local-storage';

import i18n from "i18next";
import { pageMapDispatchToProps, pageMapStateToProps } from "./pages/common";
import { connect } from "react-redux";

const App = ({ setLang }: any) => {
        useEffect(() => {
          let pathname = window.location.pathname;
          if (pathname !== "https://starterkit.tech/faqs") {
            const currentLang = ls.get("current-language");
            if (currentLang) {
              setLang(currentLang);
              i18n.changeLanguage(currentLang);
            }
          }
        }, []);

        return (
          <>
            <Tracker />
            <Switch>
              <Route
                exact={true}
                path={routes.HOME}
                component={EntryIndexContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.COMMUNITY}
                component={CommunityContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.FILTER}
                component={EntryIndexContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.USER_FEED}
                component={EntryIndexContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.USER}
                component={ProfileContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.USER_SECTION}
                component={ProfileContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.ENTRY}
                component={EntryContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.COMMUNITIES}
                component={CommunitiesContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.FILTER_TAG}
                component={EntryIndexContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.AUTH}
                component={AuthContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.SUBMIT}
                component={SubmitContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.MARKET}
                component={MarketPage}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.EDIT}
                component={SubmitContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.SIGN_UP}
                component={SignUpContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.ONBOARD}
                component={OnboardFriend}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.EDIT_DRAFT}
                component={SubmitContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.WITNESSES}
                component={WitnessesContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.PROPOSALS}
                component={ProposalsIndexContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.PROPOSAL_DETAIL}
                component={ProposalDetailContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.ABOUT}
                component={AboutPageContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.GUESTS}
                component={GuestPostPageContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.CONTRIBUTE}
                component={ContributePageContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.PRIVACY}
                component={PrivacyPageContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.WHITE_PAPER}
                component={WhitePaperPageContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.TOS}
                component={TosPageContainer}
              />
              <Route
                exact={true}
                strict={true}
                path={routes.CONTRIBUTORS}
                component={ContributorsPageContainer}
              />
              <Route component={NotFound} />
            </Switch>
          </>
        );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(App);
