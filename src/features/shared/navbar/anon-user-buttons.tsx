import { Button } from "@ui/button";
import React from "react";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";

export function AnonUserButtons() {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);

  return activeUser ? (
    <></>
  ) : (
    <div className="login-required flex ml-2 gap-2">
      <Button className="btn-login" onClick={() => toggleUIProp("login")}>
        {i18next.t("g.login")}
      </Button>

      <Button href="/signup" className="flex items-center justify-center" outline={true}>
        {i18next.t("g.signup")}
      </Button>
    </div>
  );
}
