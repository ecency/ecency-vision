import { Dropdown, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import React, { PropsWithChildren } from "react";
import { classNameObject } from "@ui/util";
import { chevronDownSvgForSlider } from "@ui/svg";

interface Props {
  label: string;
  isSelected: boolean;
}

export function PageMenuMobileDropdown({ children, label, isSelected }: PropsWithChildren<Props>) {
  return (
    <div
      className={classNameObject({
        "flex community-menu-item lg:hidden": true,
        "selected-item": isSelected
      })}
    >
      <div className="bg-gray-100 items-center dark:bg-gray-900 rounded-3xl py-3 px-4 hover:text-blue-dark-sky">
        <Dropdown>
          <DropdownToggle className="text-sm flex items-center gap-2">
            {label}
            {chevronDownSvgForSlider}
          </DropdownToggle>
          <DropdownMenu align="left">{children}</DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}
