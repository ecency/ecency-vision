import React from "react";
import { History } from "history";
import { history as historyFromStore } from "../../store";
import { Account } from "@/entities";

export const makePath = (username: string) => `/@${username}`;

interface Props {
  history: History;
  children: JSX.Element;
  username: string;
  addAccount: (data: Account) => void;
  afterClick?: () => void;
  target?: string;
  className?: string;
}

export function ProfileLink(p: Props) {
  const clicked = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    const { username, history = historyFromStore, addAccount, afterClick } = p;

    addAccount({ name: username });

    if (p.target !== "_blank") {
      history!.push(makePath(username));
    } else {
      window.open(makePath(p.username), "_blank");
    }

    if (afterClick) afterClick();
  };

  return (
    <a
      href={p.target === "_blank" ? "#" : makePath(p.username)}
      className={p.className}
      onClick={clicked}
    >
      {p.children}
    </a>
  );
}
