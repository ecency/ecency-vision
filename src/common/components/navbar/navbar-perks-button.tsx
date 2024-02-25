import React from "react";
import { Button } from "@ui/button";
import { UilFire } from "@iconscout/react-unicons";
import { _t } from "../../i18n";

export function NavbarPerksButton() {
  return (
    <Button to="/perks" icon={<UilFire />} className="font-semibold whitespace-nowrap text-sm">
      {_t("user-nav.perks")}
    </Button>
  );
}
