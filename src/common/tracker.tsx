import React, { Component, useState, useEffect } from "react";
import { Provider } from "react-redux";
import store from "./store";
import { PageProps } from "./pages/common";
import { ActiveUser } from "./store/active-user/types";
import { updateActiveUser } from "./store/active-user";
import { connect } from "react-redux";
import { pageMapStateToProps, pageMapDispatchToProps } from "./pages/common";
import LinearProgress from "./components/linear-progress";
import defaults from "./constants/defaults.json";
import axios from "axios";
import { Global } from "./store/global/types";
import { logUser } from "./helper/log-user";

interface Props {
  global: Global;
  activeUser: ActiveUser | null;
  updateActiveUser: () => void;
}
interface State {}

const Tracker = (props: Props) => {
  const [showLodingSymbol, setShowLoadingSymbol] = useState(true);
  const { updateActiveUser } = props;

  useEffect(() => {
    const { activeUser, global } = props;
    if (activeUser) {
      if (activeUser && !showLodingSymbol) {
        logUser(activeUser, global);
      } else {
        updateActiveUser();
      }
    }
  }, [showLodingSymbol]);

  useEffect(() => {
    const onPageLoad = () => {
      setShowLoadingSymbol(false);
    };

    // Check if the page has already loaded
    if (document.readyState === "complete") {
      onPageLoad();
      return () => {};
    } else {
      window.addEventListener("load", onPageLoad);
      // Remove the event listener when component unmounts
      return () => window.removeEventListener("load", onPageLoad);
    }
  });

  const { name } = defaults;
  return showLodingSymbol ? (
    <div>
      <h1>Loading {name}...</h1>
    </div>
  ) : null;
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(Tracker);
