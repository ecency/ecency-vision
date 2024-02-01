import useDebounce from "react-use/lib/useDebounce";
import { useLocation } from "react-router";
import { useContext } from "react";
import { NostrContext } from "@ecency/ns-query";
import React from "react";

export function ChatLocaitonListener() {
  const location = useLocation();
  const { setSleepMode } = useContext(NostrContext);

  useDebounce(() => setSleepMode(!location.pathname.startsWith("/chats")), 3000, [location]);

  return <></>;
}
