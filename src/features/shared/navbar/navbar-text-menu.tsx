import React from "react";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";
import i18next from "i18next";

export function NavbarTextMenu() {
  const usePrivate = useGlobalStore((state) => state.usePrivate);

  return (
    <div className="text-menu flex items-center justify-center h-full md:mr-2">
      <Link
        className="menu-item text-gunmetal hover:text-gray-warm dark:text-blue-duck-egg mt-0"
        href="/discover"
      >
        {i18next.t("navbar.discover")}
      </Link>
      <Link
        className="menu-item text-gunmetal hover:text-gray-warm dark:text-blue-duck-egg mt-0"
        href="/communities"
      >
        {i18next.t("navbar.communities")}
      </Link>
      {usePrivate && (
        <Link
          className="menu-item text-gunmetal hover:text-gray-warm dark:text-blue-duck-egg mt-0"
          href="/decks"
        >
          {i18next.t("navbar.decks")}
        </Link>
      )}
    </div>
  );
}
