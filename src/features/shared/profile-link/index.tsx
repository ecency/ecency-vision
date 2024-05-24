import React, { ReactElement } from "react";
import Link from "next/link";

export const makePath = (username: string) => `/@${username}`;

interface Props {
  children: ReactElement;
  username: string;
  afterClick?: () => void;
  target?: string;
  className?: string;
}

export function ProfileLink({ afterClick, target, className, children, username }: Props) {
  const clicked = async (e: React.MouseEvent<HTMLElement>) => {
    if (afterClick) afterClick();
  };

  return (
    <Link
      href={target === "_blank" ? "#" : makePath(username)}
      className={className}
      onClick={clicked}
    >
      {children}
    </Link>
  );
}
