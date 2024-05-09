import { Button } from "@ui/button";
import React from "react";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import Link from "next/link";

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

      <Link href="/signup">
        <Button outline={true}>{i18next.t("g.signup")}</Button>
      </Link>
    </div>
  );
}
