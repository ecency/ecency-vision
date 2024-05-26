import React from "react";
import { Profile } from "@ecency/ns-query";
import Link from "next/link";
import { classNameObject } from "@ui/util";

interface Props {
  showUsername?: boolean;
  isGif: boolean;
  isEmoji: boolean;
  profile?: Profile;
}

export function ChatMessageUsernameLabel({ showUsername, isEmoji, isGif, profile }: Props) {
  return showUsername ? (
    <Link
      className={classNameObject({
        "font-semibold text-sm mb-2 text-blue-dark-sky": true,
        "px-2.5": isGif || isEmoji
      })}
      style={{
        display: "inherit"
      }}
      href={`/@${profile!.name}`}
    >
      {profile!.name}
    </Link>
  ) : (
    <></>
  );
}
