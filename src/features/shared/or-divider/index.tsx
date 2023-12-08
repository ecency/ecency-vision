import React, { Component } from "react";
import "./_index.scss";
import i18next from "i18next";

export default class OrDivider extends Component {
  render() {
    return (
      <>
        <div className="or-divider">{i18next.t("g.or")}</div>
      </>
    );
  }
}
