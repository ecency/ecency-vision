import React, { useMemo, useState } from "react";
import { Route, Switch } from "react-router-dom";
import EntryIndexContainer from "./pages/index";
import { EntryScreen } from "./pages/entry";
import { SearchMorePageContainer, SearchPageContainer } from "./pages/search";
import { ProposalDetailContainer, ProposalsIndexContainer } from "./pages/proposals";
import NotFound from "./components/404";
import Tracker from "./tracker";
import {
  AboutPage,
  ContributePage,
  ContributorsPage,
  FaqPage,
  GuestPostPage,
  PrivacyPage,
  TosPage,
  WhitePaperPage
} from "./pages/static";
import routes from "./routes";
import * as ls from "./util/local-storage";
import i18n from "i18next";
import { pageMapDispatchToProps, pageMapStateToProps } from "./pages/common";
import { connect } from "react-redux";
import loadable from "@loadable/component";
import Announcement from "./components/announcement";
import FloatingFAQ from "./components/floating-faq";
import { useMappedStore } from "./store/use-mapped-store";
import { EntriesCacheManager } from "./core";
import { UserActivityRecorder } from "./components/user-activity-recorder";
import { useGlobalLoader } from "./util/use-global-loader";
import useMount from "react-use/lib/useMount";
import { ChatPopUp } from "./features/chats/components/chat-popup";
import { ChatContextProvider } from "@ecency/ns-query";
import { useGetAccountFullQuery } from "./api/queries";
import { UIManager } from "@ui/core";
import defaults from "./constants/defaults.json";
import { getAccessToken } from "./helper/user-token";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Define lazy pages
const ProfileContainer = loadable(() => import("./pages/profile-functional"));
const ProfilePage = (props: any) => <ProfileContainer {...props} />;

const CommunityContainer = loadable(() => import("./pages/community-functional"));
const CommunityPage = (props: any) => <CommunityContainer {...props} />;

const DiscoverContainer = loadable(() => import("./pages/discover"));
const DiscoverPage = (props: any) => <DiscoverContainer {...props} />;

const WitnessesContainer = loadable(() => import("./pages/witnesses"));
const WitnessesPage = (props: any) => <WitnessesContainer {...props} />;

const AuthContainer = loadable(() => import("./pages/auth"));
const AuthPage = (props: any) => <AuthContainer {...props} />;

const SubmitContainer = loadable(() => import("./pages/submit"));
const SubmitPage = (props: any) => <SubmitContainer {...props} />;

const ChatsContainer = loadable(() => import("./features/chats/screens/chats"));
const ChatsPage = (props: any) => <ChatsContainer {...props} />;

const OnboardContainer = loadable(() => import("./pages/onboard"));
const OnboardPage = (props: any) => <OnboardContainer {...props} />;

const MarketContainer = loadable(() => import("./pages/market"));
const MarketPage = (props: any) => <MarketContainer {...props} />;

const SignUpContainer = loadable(() => import("./pages/sign-up"));
const SignUpPage = (props: any) => <SignUpContainer {...props} />;

const CommunitiesContainer = loadable(() => import("./pages/communities"));
const CommunitiesPage = (props: any) => <CommunitiesContainer {...props} />;

const CommunityCreateContainer = loadable(() => import("./pages/community-create"));
const CommunityCreatePage = (props: any) => <CommunityCreateContainer {...props} />;

const CommunityCreateHSContainer = loadable(() => import("./pages/community-create-hs"));
const CommunityCreateHSPage = (props: any) => <CommunityCreateHSContainer {...props} />;

const EntryAMPContainer = loadable(() => import("./pages/entry/index-amp"));
const EntryPage = (props: any) => {
  const [isAmp, setIsAmp] = useState(props.location.search.includes("?amps"));
  return isAmp ? <EntryAMPContainer {...props} /> : <EntryScreen {...props} />;
};

const PurchaseContainer = loadable(() => import("./pages/purchase"));
const PurchasePage = (props: any) => <PurchaseContainer {...props} />;

const DecksPage = loadable(() => import("./pages/decks"));
const EcencyPerksPage = loadable(() => import("./features/perks/screens/main"));

const App = (props: any) => {
  const { global, activeUser } = useMappedStore();
  const { hide } = useGlobalLoader();

  const { data: activeUserAccount } = useGetAccountFullQuery(activeUser?.username);

  useMount(() => {
    // Drop hiding from main queue to give React time to render
    setTimeout(() => hide(), 1);

    let pathname = window.location.pathname;
    if (pathname !== "/faq") {
      const currentLang = ls.get("current-language");
      if (currentLang) {
        props.setLang(currentLang);
        i18n.changeLanguage(currentLang);
      }
    }
  });

  const accessToken = useMemo(
    () => (activeUser ? getAccessToken(activeUser.username) ?? "" : ""),
    [activeUser]
  );

  return (
    <UIManager>
      <EntriesCacheManager>
        {/*Excluded from production*/}
        <ReactQueryDevtools initialIsOpen={false} />
        <Tracker />
        <UserActivityRecorder />
        <ChatContextProvider
          privateApiHost={defaults.base}
          activeUsername={activeUser?.username}
          activeUserData={activeUserAccount}
          ecencyAccessToken={accessToken}
        >
          <Switch>
            <Route exact={true} path={routes.HOME} component={EntryIndexContainer} />
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
            <Route exact={true} strict={true} path={routes.PURCHASE} component={PurchasePage} />
            <Route exact={true} strict={true} path={routes.USER} component={ProfilePage} />
            <Route exact={true} strict={true} path={routes.USER_SECTION} component={ProfilePage} />
            <Route exact={true} strict={true} path={routes.ENTRY} component={EntryPage} />
            <Route
              exact={true}
              strict={true}
              path={routes.COMMUNITIES}
              component={CommunitiesPage}
            />
            <Route
              exact={true}
              strict={true}
              path={routes.COMMUNITIES_CREATE}
              component={CommunityCreatePage}
            />
            <Route
              exact={true}
              strict={true}
              path={routes.COMMUNITIES_CREATE_HS}
              component={CommunityCreateHSPage}
            />
            <Route exact={true} strict={true} path={routes.COMMUNITY} component={CommunityPage} />
            <Route
              exact={true}
              strict={true}
              path={routes.FILTER_TAG}
              component={EntryIndexContainer}
            />
            <Route exact={true} strict={true} path={routes.DISCOVER} component={DiscoverPage} />
            <Route exact={true} path={routes.SEARCH} component={SearchPageContainer} />
            <Route exact={true} path={routes.SEARCH_MORE} component={SearchMorePageContainer} />
            <Route exact={true} strict={true} path={routes.AUTH} component={AuthPage} />
            <Route exact={true} strict={true} path={routes.SUBMIT} component={SubmitPage} />
            <Route
              exact={true}
              strict={true}
              path={routes.CHATS}
              component={global.usePrivate ? ChatsPage : NotFound}
            />
            <Route exact={true} strict={true} path={routes.MARKET} component={MarketPage} />
            <Route exact={true} strict={true} path={routes.EDIT} component={SubmitPage} />
            <Route exact={true} strict={true} path={routes.SIGN_UP} component={SignUpPage} />
            <Route exact={true} strict={true} path={routes.ONBOARD} component={OnboardPage} />
            <Route exact={true} strict={true} path={routes.EDIT_DRAFT} component={SubmitPage} />
            <Route exact={true} strict={true} path={routes.WITNESSES} component={WitnessesPage} />
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
              path={`/me${routes.PROPOSAL_DETAIL}`}
              component={ProposalDetailContainer}
            />
            <Route exact={true} strict={true} path={routes.ABOUT} component={AboutPage} />
            <Route exact={true} strict={true} path={routes.GUESTS} component={GuestPostPage} />
            <Route exact={true} strict={true} path={routes.CONTRIBUTE} component={ContributePage} />
            <Route exact={true} strict={true} path={routes.PRIVACY} component={PrivacyPage} />
            <Route
              exact={true}
              strict={true}
              path={routes.WHITE_PAPER}
              component={WhitePaperPage}
            />
            <Route exact={true} strict={true} path={routes.TOS} component={TosPage} />
            <Route exact={true} strict={true} path={routes.FAQ} component={FaqPage} />
            <Route
              exact={true}
              strict={true}
              path={routes.CONTRIBUTORS}
              component={ContributorsPage}
            />
            <Route exact={true} strict={true} path={routes.PERKS} component={EcencyPerksPage} />
            <Route
              exact={true}
              strict={true}
              path={routes.DECKS}
              component={global.usePrivate ? DecksPage : NotFound}
            />
            <Route component={NotFound} />
          </Switch>

          <Announcement activeUser={props.activeUser} />
          <FloatingFAQ />
          <ChatPopUp {...props} />
        </ChatContextProvider>
        <div id="modal-overlay-container" />
        <div id="modal-dialog-container" />
        <div id="popper-container" />
      </EntriesCacheManager>
    </UIManager>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(App);
