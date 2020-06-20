import React, { Component } from "react";
import { History } from "history";

import isEqual from "react-fast-compare";

import { Global } from "../../store/global/types";

import { getCommunity } from "../../api/bridge";

export const makePath = (filter: string, tag: string): string => {
  return `/${filter}/${tag}`;
};

interface Props {
  global: Global;
  history: History;
  tag: string;
  children: JSX.Element;
  type?: "link" | "span";
}

const cache = {};

export default class TagLink extends Component<Props> {
  public static defaultProps: Partial<Props> = {
    type: "link",
  };

  _mounted: boolean = true;

  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return !isEqual(this.props.children, nextProps.children);
  }

  componentDidMount(): void {
    const { tag } = this.props;

    if (tag.startsWith("hive-")) {
      if (cache[tag] === undefined) {
        getCommunity(tag).then((c) => {
          if (c) {
            cache[tag] = c.title;
            this.forceUpdate(); // trigger render
          }
        });
      }
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  clicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { tag, global, history } = this.props;
    const { filter } = global;

    const newLoc = makePath(filter, tag);

    history.push(newLoc);
  };

  stateSet = (obj: {}, cb = undefined) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  render() {
    const { children, global, tag, type } = this.props;

    const { filter } = global;

    const href = makePath(filter, tag);

    if (type === "link") {
      const props = Object.assign({}, children.props, { href, onClick: this.clicked });

      if (cache[tag]) {
        props.children = cache[tag];
      }

      return React.createElement("a", props);
    } else if (type === "span") {
      const props = Object.assign({}, children.props);

      if (cache[tag]) {
        props.children = cache[tag];
      }

      return React.createElement("span", props);
    } else {
      return null;
    }
  }
}
