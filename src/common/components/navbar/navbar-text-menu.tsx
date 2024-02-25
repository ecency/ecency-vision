import { Link } from "react-router-dom";
import { _t } from "../../i18n";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";

export function NavbarTextMenu() {
  const { global } = useMappedStore();

  return (
    <div className="text-menu hidden sm:flex items-center justify-center h-full md:mr-2 ml-3">
      <Link
        className="menu-item text-gunmetal hover:text-gray-warm dark:text-blue-duck-egg mt-0"
        to="/discover"
      >
        {_t("navbar.discover")}
      </Link>
      <Link
        className="menu-item text-gunmetal hover:text-gray-warm dark:text-blue-duck-egg mt-0"
        to="/communities"
      >
        {_t("navbar.communities")}
      </Link>
      {global.usePrivate && (
        <Link
          className="menu-item text-gunmetal hover:text-gray-warm dark:text-blue-duck-egg mt-0"
          to="/decks"
        >
          {_t("navbar.decks")}
        </Link>
      )}
    </div>
  );
}
