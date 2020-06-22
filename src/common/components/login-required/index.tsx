import React, { Component } from "react";

import { hsLogin } from "../../helper/hive-signer";

interface Props {
  children: JSX.Element;
}

export default class LoginRequired extends Component<Props> {
  clicked = () => {
    hsLogin()
  };
  render() {
    const { children } = this.props;

    const clonedChildren = React.cloneElement(children, {
      onClick: this.clicked,
    });

    return clonedChildren;
  }
}
