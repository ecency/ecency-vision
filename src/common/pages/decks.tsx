import { Decks } from "../components/decks";
import React from "react";
import { History } from "history";
import { connect } from "react-redux";
import { pageMapDispatchToProps, pageMapStateToProps } from "./common";
import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import { useMappedStore } from "../store/use-mapped-store";
import { getMetaProps } from "../util/get-meta-props";
import { _t } from "../i18n";

interface Props {
  history: History;
}

const DecksPageComponent = ({ history }: Props) => {
  const store = useMappedStore();

  return (
    <div className="p-0 m-0 mw-full">
      <Meta {...getMetaProps(store)} title={_t("decks.title")} />
      <Theme global={store.global} />
      <Feedback activeUser={store.activeUser} />
      <div id="deck-media-view-container" />
      <Decks history={history} />
    </div>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(DecksPageComponent);
