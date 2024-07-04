"use client";

import i18next from "i18next";
import { ManageAuthorities } from "@/app/[...slugs]/_profile-components/manage-authority";
import { AccountRecovery } from "@/app/[...slugs]/_profile-components/recovery-account";
import { PasswordUpdate } from "@/app/[...slugs]/_profile-components/password-update";
import React, { useState } from "react";
import { useGlobalStore } from "@/core/global-store";

export function ProfilePermissions() {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [tabState, setTabState] = useState(1);

  return activeUser ? (
    <>
      <div className="permission-menu">
        <div className="permission-menu-items">
          <h6
            className={
              tabState === 1 ? "border-b border-[--border-color] pb-3 tab current-tab" : "tab"
            }
            onClick={() => setTabState(1)}
          >
            {i18next.t("manage-authorities.title")}
          </h6>
        </div>
        <div className="permission-menu-items">
          <h6
            className={
              tabState === 2 ? "border-b border-[--border-color] pb-3 tab current-tab" : "tab"
            }
            onClick={() => setTabState(2)}
          >
            {i18next.t("account-recovery.title")}
          </h6>
        </div>
        <div className="permission-menu-items">
          <h6
            className={
              tabState === 3 ? "border-b border-[--border-color] pb-3 tab current-tab" : "tab"
            }
            onClick={() => setTabState(3)}
          >
            {i18next.t("password-update.title")}
          </h6>
        </div>
      </div>
      <div className="container-fluid">
        {tabState === 1 && <ManageAuthorities />}
        <div className="grid grid-cols-12 pb-4">
          <div className="col-span-12 sm:col-span-6">
            {tabState === 2 && <AccountRecovery />}
            {tabState === 3 && <PasswordUpdate />}
          </div>
        </div>
      </div>
    </>
  ) : (
    <></>
  );
}
