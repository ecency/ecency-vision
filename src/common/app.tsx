import React from "react";
import { Route, Switch } from "react-router-dom";

import EntryIndexContainer from "./pages/entry-index";
import ProfileContainer from "./pages/profile";
import EntryContainer from "./pages/entry";

import routes from "./routes";

const App = () => {
  return (
    <>
      <Switch>
        <Route exact={true} path={routes.HOME} component={EntryIndexContainer} />
        <Route exact={true} strict={true} path={routes.FILTER} component={EntryIndexContainer} />
        <Route exact={true} strict={true} path={routes.FILTER_TAG} component={EntryIndexContainer} />
        <Route exact={true} strict={true} path={routes.USER} component={ProfileContainer} />
        <Route exact={true} strict={true} path={routes.USER_SECTION} component={ProfileContainer} />
        <Route exact={true} strict={true} path={routes.ENTRY} component={EntryContainer} />
      </Switch>
    </>
  );
};

export default App;
