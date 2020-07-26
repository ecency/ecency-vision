import React, { Component } from "react";

import { History } from "history";

import { Entry } from "../../store/entries/types";

import { getPost } from "../../api/bridge";

export const makePath = (category: string, author: string, permlink: string, toReplies: boolean = false) =>
  `/${category}/@${author}/${permlink}${toReplies ? "#replies" : ""}`;

interface PartialEntry {
  category: string;
  author: string;
  permlink: string;
}

interface Props {
  history: History;
  children: JSX.Element;
  entry: Entry | PartialEntry;
  toReplies: boolean;
  afterClick?: () => void;
}

export default class EntryLink extends Component<Props> {
  public static defaultProps = {
    toReplies: false,
  };

  clicked = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { history, toReplies, afterClick } = this.props;
    let { entry: _entry } = this.props;

    if (!("title" in _entry)) {
      // Get full content if the "entry" passed is "PartialEntry"
      try {
        const resp = await getPost(_entry.author, _entry.permlink);
        if(resp){
          _entry = resp
        }
      } catch (e) {
        return;
      }
    }

    const { category, author, permlink } = _entry;

    history.push(makePath(category, author, permlink, toReplies));

    if(afterClick) afterClick();
  };

  render() {
    const { children, entry, toReplies } = this.props;

    const href = makePath(entry.category, entry.author, entry.permlink, toReplies);

    const props = Object.assign({}, children.props, { href, onClick: this.clicked });

    return React.createElement("a", props);
  }
}
