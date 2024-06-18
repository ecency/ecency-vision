import React, { useCallback } from "react";
import useMount from "react-use/lib/useMount";
import useUnmount from "react-use/lib/useUnmount";

interface Props {
  onBottom: () => any;
}

export function DetectBottom({ onBottom }: Props) {
  const handleScroll = useCallback(() => {
    if (window.innerHeight + window.scrollY + 100 >= document.body.offsetHeight) {
      onBottom();
    }
  }, [onBottom]);

  useMount(() => {
    window.addEventListener("scroll", handleScroll);
  });

  useUnmount(() => {
    window.removeEventListener("scroll", handleScroll);
  });

  return <></>;
}
