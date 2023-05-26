import React, { Component } from "react";

import { History } from "history";

import { Entry } from "../../store/entries/types";

import { getPost } from "../../api/bridge";

import { history as historyFromStore } from "../../store";

export const makePath = (
  category: string,
  author: string,
  permlink: string,
  toReplies: boolean = false
) => `/${category}/@${author}/${permlink}${toReplies ? "#replies" : ""}`;

export interface PartialEntry {
  category: string;
  author: string;
  permlink: string;
}

interface Props {
  history?: History;
  children: JSX.Element;
  entry: Entry | PartialEntry;
  afterClick?: () => void;
  target?: string;
}

export class EntryLink extends Component<Props> {
  clicked = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { history = historyFromStore, afterClick } = this.props;

    if (afterClick) afterClick();

    let { entry: _entry } = this.props;

    if (!("title" in _entry)) {
      // Get full content if the "entry" passed is "PartialEntry"
      try {
        const resp = await getPost(_entry.author, _entry.permlink);
        if (resp) {
          _entry = resp;
        }
      } catch (e) {
        return;
      }
    }

    const { category, author, permlink } = _entry;

    if (history) {
      history.push(makePath(category, author, permlink));
    }
  };

  render() {
    const { children, entry } = this.props;

    const href = makePath(entry.category, entry.author, entry.permlink);

    const props = Object.assign({}, children.props, { href, onClick: this.clicked });

    if (this.props.target) {
      props.onClick = (e: React.MouseEvent<HTMLElement>) => {
        this.clicked(e);

        window.open(props.href, "_blank");
      };
    }

    return React.createElement("a", props);
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    children: p.children,
    entry: p.entry,
    afterClick: p.afterClick,
    target: p.target
  };

  return <EntryLink {...props} />;
};
