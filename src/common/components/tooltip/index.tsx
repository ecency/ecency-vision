import React, { Component } from "react";

interface TooltipProps {
  content: string;
  children: JSX.Element;
}

export default class MyTooltip extends Component<TooltipProps> {
  render() {
    const { content, children } = this.props;

    const newChildren = React.cloneElement(children, { title: content });

    return newChildren;
  }
}
