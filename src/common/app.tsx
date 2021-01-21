import React from "react";
import {Route, Switch} from "react-router-dom";

import EntryIndexContainer from "./pages/entry-index";
import ProfileContainer from "./pages/profile";
import EntryContainer from "./pages/entry";
import CommunitiesContainer, {CommunityCreateContainer, CommunityCreateHSContainer} from "./pages/communities";
import CommunityContainer from "./pages/community";
import DiscoverContainer from "./pages/discover";
import {SearchPageContainer, SearchMorePageContainer} from "./pages/search";
import WitnessesContainer from "./pages/witnesses";
import {ProposalsIndexContainer, ProposalDetailContainer} from "./pages/proposals";
import AuthContainer from "./pages/auth";
import SubmitContainer from "./pages/submit";
import SignUpContainer from "./pages/sign-up";
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

const App = () => {
    return (
        <>
            <Tracker/>
            <Switch>
                <Route exact={true} path={routes.HOME} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.FILTER} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.USER_FEED} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.USER} component={ProfileContainer}/>
                <Route exact={true} strict={true} path={routes.USER_SECTION} component={ProfileContainer}/>
                <Route exact={true} strict={true} path={routes.ENTRY} component={EntryContainer}/>
                <Route exact={true} strict={true} path={routes.COMMUNITIES} component={CommunitiesContainer}/>
                <Route exact={true} strict={true} path={routes.COMMUNITIES_CREATE} component={CommunityCreateContainer}/>
                <Route exact={true} strict={true} path={routes.COMMUNITIES_CREATE_HS} component={CommunityCreateHSContainer}/>
                <Route exact={true} strict={true} path={routes.COMMUNITY} component={CommunityContainer}/>
                <Route exact={true} strict={true} path={routes.FILTER_TAG} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.DISCOVER} component={DiscoverContainer}/>
                <Route exact={true} path={routes.SEARCH} component={SearchPageContainer}/>
                <Route exact={true} path={routes.SEARCH_MORE} component={SearchMorePageContainer}/>
                <Route exact={true} strict={true} path={routes.AUTH} component={AuthContainer}/>
                <Route exact={true} strict={true} path={routes.SUBMIT} component={SubmitContainer}/>
                <Route exact={true} strict={true} path={routes.EDIT} component={SubmitContainer}/>
                <Route exact={true} strict={true} path={routes.SIGN_UP} component={SignUpContainer}/>
                <Route exact={true} strict={true} path={routes.EDIT_DRAFT} component={SubmitContainer}/>
                <Route exact={true} strict={true} path={routes.WITNESSES} component={WitnessesContainer}/>
                <Route exact={true} strict={true} path={routes.PROPOSALS} component={ProposalsIndexContainer}/>
                <Route exact={true} strict={true} path={routes.PROPOSAL_DETAIL} component={ProposalDetailContainer}/>
                <Route exact={true} strict={true} path={routes.ABOUT} component={AboutPageContainer}/>
                <Route exact={true} strict={true} path={routes.GUESTS} component={GuestPostPageContainer}/>
                <Route exact={true} strict={true} path={routes.CONTRIBUTE} component={ContributePageContainer}/>
                <Route exact={true} strict={true} path={routes.PRIVACY} component={PrivacyPageContainer}/>
                <Route exact={true} strict={true} path={routes.WHITE_PAPER} component={WhitePaperPageContainer}/>
                <Route exact={true} strict={true} path={routes.TOS} component={TosPageContainer}/>
                <Route exact={true} strict={true} path={routes.FAQ} component={FaqPageContainer}/>
                <Route exact={true} strict={true} path={routes.CONTRIBUTORS} component={ContributorsPageContainer}/>
                <Route component={NotFound}/>
            </Switch>
        </>
    );
};

export default App;
