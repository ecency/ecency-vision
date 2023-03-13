import React, { Component } from "react";
import { History } from "history";
import { history as historyFromStore } from "../../store";
import { Account } from "../../store/accounts/types";

export const makePath = (username: string) => `/@${username}`;

interface Props {
  history: History;
  children: JSX.Element;
  username: string;
  addAccount: (data: Account) => void;
  afterClick?: () => void;
}

export default (p: Props) => {
  const clicked = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { username, history = historyFromStore, addAccount, afterClick } = p;

    addAccount({ name: username });

    history!.push(makePath(username));

    if (afterClick) afterClick();
  };

  return (
    <a href={makePath(p.username)} onClick={clicked}>
      {p.children}
    </a>
  );
};
