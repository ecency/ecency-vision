import { Decks } from "../components/decks";
import React from "react";
import { History } from "history";
import { connect } from "react-redux";
import { pageMapDispatchToProps, pageMapStateToProps } from "./common";

interface Props {
  history: History;
}

const DecksPageComponent = ({ history }: Props) => {
  return (
    <div className="p-0 m-0 mw-100">
      <Decks history={history} />
    </div>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(DecksPageComponent);
