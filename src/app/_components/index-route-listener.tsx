"use client";

import { useGlobalStore } from "@/core/global-store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useMount from "react-use/lib/useMount";

export function IndexRouteListener() {
  const router = useRouter();

  const activeUser = useGlobalStore((s) => s.activeUser);
  const filter = useGlobalStore((s) => s.filter);

  const moveToSection = (hash?: string) => {
    if (!hash) {
      return;
    }
    document.querySelector(hash)?.scrollIntoView();
  };

  useMount(() => {
    setTimeout(() => moveToSection(location.hash), 1000);
  });

  useEffect(() => {
    if (activeUser) {
      router.push(`/${filter}`);
    }
  }, [activeUser, filter, router]);

  return <></>;
}
