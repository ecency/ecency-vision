import React from "react";
import {Route, Switch} from "react-router-dom";

import EntryIndexContainer from "./pages/entry-index";
import ProfileContainer from "./pages/profile";
import EntryContainer from "./pages/entry";
import CommunitiesContainer from "./pages/communities";
import DiscoverContainer from "./pages/discover";
import AuthContainer from "./pages/auth";
import SubmitContainer from "./pages/submit";
import NotFound from "./components/404";

import {
    AboutPageContainer,
    GuestPostPageContainer,
    ContributePageContainer,
    PrivacyPageContainer,
    WhitePaperPageContainer,
    TosPageContainer,
    FaqPageContainer
} from "./pages/static";

import routes from "./routes";

const App = () => {
    return (
        <>
            <Switch>
                <Route exact={true} path={routes.HOME} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.FILTER} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.FILTER_TAG} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.USER_FEED} component={EntryIndexContainer}/>
                <Route exact={true} strict={true} path={routes.USER} component={ProfileContainer}/>
                <Route exact={true} strict={true} path={routes.USER_SECTION} component={ProfileContainer}/>
                <Route exact={true} strict={true} path={routes.ENTRY} component={EntryContainer}/>
                <Route exact={true} strict={true} path={routes.COMMUNITIES} component={CommunitiesContainer}/>
                <Route exact={true} strict={true} path={routes.DISCOVER} component={DiscoverContainer}/>
                <Route exact={true} strict={true} path={routes.AUTH} component={AuthContainer}/>
                <Route exact={true} strict={true} path={routes.SUBMIT} component={SubmitContainer}/>
                <Route exact={true} strict={true} path={routes.EDIT} component={SubmitContainer}/>
                <Route exact={true} strict={true} path={routes.ABOUT} component={AboutPageContainer}/>
                <Route exact={true} strict={true} path={routes.GUESTS} component={GuestPostPageContainer}/>
                <Route exact={true} strict={true} path={routes.CONTRIBUTE} component={ContributePageContainer}/>
                <Route exact={true} strict={true} path={routes.PRIVACY} component={PrivacyPageContainer}/>
                <Route exact={true} strict={true} path={routes.WHITE_PAPER} component={WhitePaperPageContainer}/>
                <Route exact={true} strict={true} path={routes.TOS} component={TosPageContainer}/>
                <Route exact={true} strict={true} path={routes.FAQ} component={FaqPageContainer}/>
                <Route component={() => <NotFound/>}/>
            </Switch>
        </>
    );
};

export default App;
