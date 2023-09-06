import { _t } from "../../../i18n";
import { Link } from "react-router-dom";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import "./_deck-login-overlay-placeholder.scss";
import { Button } from "@ui/button";

export const DeckLoginOverlayPlaceholder = () => {
  const { activeUser, toggleUIProp } = useMappedStore();

  return !activeUser ? (
    <div className="auth-required d-flex justify-content-center align-items-center flex-column">
      <div className="font-weight-bold mb-3">{_t("decks.auth-required-title")}</div>
      <div className="mb-3">{_t("decks.auth-required-desc")}</div>
      <div className="d-flex">
        <Button outline={true} className="mr-2" onClick={() => toggleUIProp("login")}>
          {_t("g.login")}
        </Button>
        <Link to="/signup">
          <Button>{_t("g.signup")}</Button>
        </Link>
      </div>
    </div>
  ) : (
    <></>
  );
};
