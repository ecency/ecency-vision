import React from "react";
import * as ls from "@/utils/local-storage";
import "./_index.scss";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import Link from "next/link";
import i18next from "i18next";
import { langOptions } from "@/features/i18n";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  label?: string;
}

export function SwitchLang({ label }: Props) {
  const lang = useGlobalStore((state) => state.lang);
  const setLang = useGlobalStore((state) => state.setLang);

  return (
    <div className="switch-language">
      <Dropdown>
        <DropdownToggle>{label ?? lang}</DropdownToggle>
        <DropdownMenu>
          {langOptions.map((locale) => (
            <DropdownItem
              key={locale.code}
              onClick={async () => {
                await i18next.changeLanguage(locale.code);
                setLang(locale.code);
                ls.set("current-language", locale.code);
              }}
            >
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
