import React, { ReactElement } from "react";
import { useRouter } from "next/navigation";
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
  const { push } = useRouter();

  const clicked = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();

    if (target !== "_blank") {
      await push(makePath(username));
    } else {
      window.open(makePath(username), "_blank");
    }

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
