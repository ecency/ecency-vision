import React, { Component, createElement } from "react";
import { History } from "history";

import isEqual from "react-fast-compare";

import { AppWindow } from "../../../client/window";

import { Global } from "../../store/global/types";
import { EntryFilter } from "../../store/global/types";
import { Community, Communities } from "../../store/communities/types";

import { getCommunity } from "../../api/bridge";

import isCommunity from "../../helper/is-community";
import { _t } from "../../i18n";

export const makePath = (filter: string, tag: string): string => {
  // created is default filter for community pages
  if (isCommunity(tag)) {
    return `/${EntryFilter.created}/${tag}`;
  }

  if (EntryFilter[filter as EntryFilter] === undefined) {
    return `/${EntryFilter.created}/${tag}`;
  }

  return `/${filter}/${tag}`;
};

interface CommunityTag {
  name: string;
  title: string;
}

interface Props {
  global: Global;
  history: History;
  communities?: Communities;
  tag: string | CommunityTag;
  children: JSX.Element;
  type?: "link" | "span";
}

declare var window: AppWindow;

// some tags are special community tags.
// we keep community titles for that tags inside this variable
// the reason we keep that data inside a variable is to
// avoid re-render all application with a reducer.
if (typeof window !== "undefined") {
  window.comTag = {};
}

const comTagGet = (k: string) => {
  if (typeof window !== "undefined" && window.comTag) {
    return window.comTag[k];
  }

  return undefined;
};

const comTagSet = (k: string, v: string) => {
  if (typeof window !== "undefined" && window.comTag) {
    window.comTag[k] = v;
  }
};

export class TagLink extends Component<Props> {
  public static defaultProps: Partial<Props> = {
    type: "link",
  };

  _mounted: boolean = true;

  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return (
      !isEqual(this.props.children, nextProps.children) ||
      !isEqual(this.props.communities, nextProps.communities)
    );
  }

  componentDidMount() {
    this.detectCommunity().then();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  detectCommunity = async () => {
    const { tag } = this.props;

    if (typeof tag !== "string") {
      return;
    }

    // tag is not community tag or already added to cache
    if (!isCommunity(tag) || comTagGet(tag) !== undefined) {
      return;
    }

    // temporarily assign a value to avoid multiple requests
    // skip this testing environment
    // if (typeof jest === "undefined") {
    //     comTagSet(tag, tag);
    // }

    const { communities } = this.props;

    // find community from reducer
    let community: Community | null =
      (communities && communities.find((x) => x.name === tag)) || null;

    // or fetch it from api
    if (!community) {
      community = await getCommunity(tag);
    }

    if (community) {
      comTagSet(tag, community.title);

      if (this._mounted) {
        this.forceUpdate(); // trigger render
      }
    }
  };

  clicked = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { tag, global, history } = this.props;
    const { filter } = global;

    const newLoc =
      typeof tag === "string"
        ? makePath(filter, tag)
        : makePath(filter, tag.name);

    history.push(newLoc);
  };

  render() {
    const { children, global, tag, type } = this.props;

    const { filter } = global;

    const href =
      typeof tag === "string"
        ? makePath(filter, tag)
        : makePath(filter, tag.name);

    if (type === "link") {
      const props = Object.assign({}, children.props, {
        href,
        onClick: this.clicked,
      });

      if (typeof tag === "string") {
        props.title = _t("tag.unmoderated");
        if (comTagGet(tag)) {
          props.children = comTagGet(tag);
          props.title = _t("tag.moderated");
        }
      } else {
        props.children = tag.title;
        props.title = _t("tag.moderated");
      }

      return createElement("a", props);
    } else if (type === "span") {
      const props = Object.assign({}, children.props);

      if (typeof tag === "string") {
        props.title = _t("tag.unmoderated");
        if (comTagGet(tag)) {
          props.children = comTagGet(tag);
          props.title = _t("tag.moderated");
        }
      } else {
        props.children = tag.title;
        props.title = _t("tag.moderated");
      }

      return createElement("span", props);
    } else {
      return null;
    }
  }
}

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    history: p.history,
    communities: p.communities,
    tag: p.tag,
    children: p.children,
    type: p.type,
  };

  return <TagLink {...props} />;
};
