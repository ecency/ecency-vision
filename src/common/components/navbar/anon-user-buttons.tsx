import { Button } from "@ui/button";
import { _t } from "../../i18n";
import { Link } from "react-router-dom";
import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";

export function AnonUserButtons() {
  const { activeUser, toggleUIProp } = useMappedStore();

  return activeUser ? (
    <></>
  ) : (
    <div className="login-required flex ml-2 gap-2">
      <Button
        className="btn-login"
        onClick={() => {
          toggleUIProp("login");
        }}
      >
        {_t("g.login")}
      </Button>

      <Link to="/signup">
        <Button outline={true}>{_t("g.signup")}</Button>
      </Link>
    </div>
  );
}
