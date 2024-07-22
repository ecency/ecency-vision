import React, { useCallback, useMemo } from "react";
import i18next from "i18next";
import "./_index.scss";
import { FormControl, InputGroupCopyClipboard } from "@ui/input";
import { ALL_NOTIFY_TYPES, Theme } from "@/enums";
import { useGlobalStore } from "@/core/global-store";
import { langOptions } from "@/features/i18n";
import { useUpdateNotificationsSettings } from "@/api/mutations";
import { success } from "@/features/shared";
import * as ls from "@/utils/local-storage";
import currencies from "@/consts/currencies.json";
import { useNotificationsSettingsQuery } from "@/api/queries";

export function Preferences() {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const setCurrency = useGlobalStore((s) => s.setCurrency);

  const nsfw = useGlobalStore((s) => s.nsfw);
  const setNsfw = useGlobalStore((s) => s.setNsfw);

  const theme = useGlobalStore((s) => s.theme);
  const toggleTheme = useGlobalStore((s) => s.toggleTheme);

  const currency = useGlobalStore((s) => s.currency);
  const lang = useGlobalStore((s) => s.lang);
  const setLang = useGlobalStore((s) => s.setLang);

  const defaultTheme = useMemo(() => theme, [theme]);

  const { data: notificationSettings } = useNotificationsSettingsQuery();
  const { mutateAsync: updateNotificationSettings } = useUpdateNotificationsSettings();
  const notificationsChanged = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value === "1") {
        updateNotificationSettings({
          notifyTypes: [...ALL_NOTIFY_TYPES],
          isEnabled: true
        });
      }

      if (e.target.value === "0") {
        updateNotificationSettings({
          notifyTypes: [],
          isEnabled: false
        });
      }
    },
    [updateNotificationSettings]
  );
  const themeChanged = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      if (value === "system") {
        ls.set("use_system_theme", true);
      } else {
        ls.remove("use_system_theme");
        ls.set("theme", value);
      }
      toggleTheme(value as Theme);
      success(i18next.t("preferences.updated"));
    },
    [toggleTheme]
  );
  const currencyChanged = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value),
    [setCurrency]
  );

  return (
    <>
      <div className="preferences">
        <div className="preferences-header">{i18next.t("preferences.title")}</div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-6 xl:col-span-4">
            <div className="mb-4">
              <label>{i18next.t("preferences.notifications")}</label>
              <FormControl
                value={notificationSettings?.allows_notify ?? 0}
                type="select"
                onChange={notificationsChanged}
              >
                <option value={1}>{i18next.t("g.on")}</option>
                <option value={0}>{i18next.t("g.off")}</option>
              </FormControl>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 xl:col-span-4">
            <div className="mb-4">
              <label>{i18next.t("preferences.currency")}</label>
              <FormControl value={currency} type="select" onChange={currencyChanged}>
                {currencies.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </FormControl>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 xl:col-span-4">
            <div className="mb-4">
              <label>{i18next.t("preferences.language")}</label>
              <FormControl
                value={lang}
                type="select"
                onChange={(e: any) => {
                  setLang(e.target.value);
                  success(i18next.t("preferences.updated"));
                }}
              >
                {langOptions.map((x) => (
                  <option key={x.code} value={x.code}>
                    {x.name}
                  </option>
                ))}
              </FormControl>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 lg:col-span-6 xl:col-span-4">
            <div className="mb-4">
              <label>{i18next.t("preferences.nsfw")}</label>
              <FormControl
                value={nsfw ? 1 : 0}
                type="select"
                onChange={(e: any) => setNsfw(e.target.value)}
              >
                <option value={1}>{i18next.t("g.on")}</option>
                <option value={0}>{i18next.t("g.off")}</option>
              </FormControl>
            </div>
          </div>

          {activeUser && activeUser.username && (
            <>
              <div className="col-span-12 lg:col-span-6 xl:col-span-4">
                <div className="mb-4">
                  <label>{i18next.t("preferences.referral-link")}</label>
                  <InputGroupCopyClipboard
                    className="mb-3"
                    value={`https://ecency.com/signup?referral=${activeUser!.username}`}
                  />
                </div>
              </div>
              <div className="col-span-12 lg:col-span-6 xl:col-span-4">
                <div className="mb-4">
                  <label>{i18next.t("preferences.theme")}</label>
                  <FormControl value={Theme[defaultTheme]} type="select" onChange={themeChanged}>
                    <option value={Theme.system}>
                      {i18next.t("preferences.theme-system-default")}
                    </option>
                    <option value={Theme.day}>{i18next.t("preferences.theme-day")}</option>
                    <option value={Theme.night}>{i18next.t("preferences.theme-night")}</option>
                  </FormControl>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
