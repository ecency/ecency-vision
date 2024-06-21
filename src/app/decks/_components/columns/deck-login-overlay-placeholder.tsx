import React from "react";
import "./_deck-login-overlay-placeholder.scss";
import { Button } from "@ui/button";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";
import i18next from "i18next";

export const DeckLoginOverlayPlaceholder = () => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);

  return !activeUser ? (
    <div className="auth-required flex justify-center items-center flex-col">
      <div className="font-bold mb-3">{i18next.t("decks.auth-required-title")}</div>
      <div className="mb-3">{i18next.t("decks.auth-required-desc")}</div>
      <div className="flex">
        <Button outline={true} className="mr-2" onClick={() => toggleUIProp("login")}>
          {i18next.t("g.login")}
        </Button>
        <Link href="/signup">
          <Button>{i18next.t("g.signup")}</Button>
        </Link>
      </div>
    </div>
  ) : (
    <></>
  );
};
