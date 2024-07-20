"use client";

import React, { useState } from "react";
import "./_index.scss";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import Link from "next/link";
import i18next from "i18next";
import { langOptions } from "@/features/i18n";
import { useGlobalStore } from "@/core/global-store";
import { Button } from "@ui/button";
import { chevronDownSvgForSlider } from "@ui/svg";

interface Props {
  label?: string;
}

export function SwitchLang({ label }: Props) {
  const lang = useGlobalStore((state) => state.lang);
  const setLang = useGlobalStore((state) => state.setLang);

  const [trigger, setTrigger] = useState("");

  return (
    <div className="switch-language">
      <div className="hidden">{trigger}</div>
      <Dropdown>
        <DropdownToggle>
          <Button size="sm" className="uppercase" appearance="link" icon={chevronDownSvgForSlider}>
            {label ?? lang.split("-")[0]}
          </Button>
        </DropdownToggle>
        <DropdownMenu align="top" className="max-h-[200px] overflow-y-auto right-0">
          {langOptions.map((locale) => (
            <DropdownItem key={locale.code} onClick={() => setLang(locale.code)}>
              {locale.name}
            </DropdownItem>
          ))}
          <DropdownItem>
            <Link href="/contributors">{i18next.t("switch-lang.contributors")}</Link>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
