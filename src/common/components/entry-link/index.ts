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
}

export default class EntryLink extends Component<Props> {
  public static defaultProps = {
    toReplies: false,
  };

  goEntry = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { history, toReplies } = this.props;
    let { entry: _entry } = this.props;

    if (!("title" in _entry)) {
      // Get full content if the "entry" passed is "PartialEntry"
      try {
        const entry = await getPost(_entry.author, _entry.permlink);
      } catch (e) {
        return;
      }
    }

    const { category, author, permlink } = _entry;

    // TODO: set user reducer here
    // setVisitingEntry(entry);

    history.push(makePath(category, author, permlink, toReplies));
  };

  render() {
    const { children, entry, toReplies } = this.props;

    const href = makePath(entry.category, entry.author, entry.permlink, toReplies);

    const props = Object.assign({}, children.props, { href, onClick: this.goEntry });

    return React.createElement("a", props);
  }
}
