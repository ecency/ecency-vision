"use client";

import { useMount, useUnmount } from "react-use";

export function EntryListItemClientInit() {
  useMount(() => {
    document.getElementsByTagName("html")[0].style.position = "relative";
  });

  useUnmount(() => {
    document.getElementsByTagName("html")[0].style.position = "unset";
  });

  return <></>;
}
