import React from "react";
import i18n from "i18next";
import { Global, Theme } from "../../store/global/types";
import BaseComponent from "../base";
import { success } from "../feedback";
import { _t, langOptions } from "../../i18n";
import { getCurrencyRate } from "../../api/misc";
import currencySymbol from "../../helper/currency-symbol";
import currencies from "../../constants/currencies.json";
import { ActiveUser } from "../../store/active-user/types";
import * as ls from "../../util/local-storage";
import "./_index.scss";
import { useMappedStore } from "../../store/use-mapped-store";
import { NotifyTypes } from "../../enums";
import { FormControl, InputGroupCopyClipboard } from "@ui/input";

interface Props {
  global: Global;
  muteNotifications: () => void;
  unMuteNotifications: () => void;
  setCurrency: (currency: string, rate: number, symbol: string) => void;
  setLang: (lang: string) => void;
  setNsfw: (value: boolean) => void;
  activeUser: ActiveUser;
  toggleTheme: (theme_key?: Theme) => void;
  updateNotificationsSettings: (username: string) => void;
  setNotificationsSettingsItem: (type: NotifyTypes, value: boolean) => void;
}

interface State {
  inProgress: boolean;
  defaultTheme: string;
}

export class Preferences extends BaseComponent<Props, State> {
  state: State = {
    inProgress: false,
    defaultTheme: ""
  };

  notificationsChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {
      muteNotifications,
      unMuteNotifications,
      updateNotificationsSettings,
      setNotificationsSettingsItem,
      activeUser
    } = this.props;

    if (e.target.value === "1") {
      unMuteNotifications();
      setNotificationsSettingsItem(NotifyTypes.ALLOW_NOTIFY, true);
      updateNotificationsSettings(activeUser.username);
    }

    if (e.target.value === "0") {
      muteNotifications();
      setNotificationsSettingsItem(NotifyTypes.ALLOW_NOTIFY, false);
      updateNotificationsSettings(activeUser.username);
    }

    success(_t("preferences.updated"));
  };

  themeChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { toggleTheme } = this.props;
    const { value } = e.target;
    if (value === "system") {
      ls.set("use_system_theme", true);
    } else {
      ls.remove("use_system_theme");
      ls.set("theme", value);
    }
    this.setState({ ...this.state, defaultTheme: value });
    toggleTheme(value as Theme);
    success(_t("preferences.updated"));
  };

  currencyChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value: currency } = e.target;

    this.stateSet({ inProgress: true });
    getCurrencyRate(currency)
      .then((rate) => {
        const symbol = currencySymbol(currency);
        const { setCurrency } = this.props;

        setCurrency(currency, rate, symbol);
        success(_t("preferences.updated"));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  languageChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { setLang } = this.props;
    const { value: code } = e.target;

    i18n.changeLanguage(code).then(() => {
      setLang(code);
      success(_t("preferences.updated"));
    });
  };

  nsfwChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { setNsfw } = this.props;
    const { value } = e.target;

    setNsfw(Boolean(Number(value)));
    success(_t("preferences.updated"));
  };

  copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("profile-edit.copied"));
  };

  componentDidMount() {
    let use_system_theme = ls.get("use_system_theme", false);
    let theme = ls.get("theme");
    if (use_system_theme) {
      theme = "system";
    }
    this.setState({ ...this.state, defaultTheme: theme });
  }

  render() {
    const { global, activeUser } = this.props;
    const { inProgress } = this.state;

    return (
      <>
        <div className="preferences">
          <div className="preferences-header">{_t("preferences.title")}</div>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12 lg:col-span-6 xl:col-span-4">
              <div className="mb-4">
                <label>{_t("preferences.notifications")}</label>
                <FormControl
                  value={global.notifications ? 1 : 0}
                  type="select"
                  onChange={this.notificationsChanged}
                >
                  <option value={1}>{_t("g.on")}</option>
                  <option value={0}>{_t("g.off")}</option>
                </FormControl>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-6 xl:col-span-4">
              <div className="mb-4">
                <label>{_t("preferences.currency")}</label>
                <FormControl
                  value={global.currency}
                  type="select"
                  onChange={this.currencyChanged}
                  disabled={inProgress}
                >
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
                <label>{_t("preferences.language")}</label>
                <FormControl
                  value={global.lang}
                  type="select"
                  onChange={this.languageChanged}
                  disabled={inProgress}
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
                <label>{_t("preferences.nsfw")}</label>
                <FormControl value={global.nsfw ? 1 : 0} type="select" onChange={this.nsfwChanged}>
                  <option value={1}>{_t("g.on")}</option>
                  <option value={0}>{_t("g.off")}</option>
                </FormControl>
              </div>
            </div>

            {activeUser && activeUser.username && (
              <>
                <div className="col-span-12 lg:col-span-6 xl:col-span-4">
                  <div className="mb-4">
                    <label>{_t("preferences.referral-link")}</label>
                    <InputGroupCopyClipboard
                      className="mb-3"
                      value={`https://ecency.com/signup?referral=${activeUser!.username}`}
                    />
                  </div>
                </div>
                <div className="col-span-12 lg:col-span-6 xl:col-span-4">
                  <div className="mb-4">
                    <label>{_t("preferences.theme")}</label>
                    <FormControl
                      value={Theme[this.state.defaultTheme]}
                      type="select"
                      onChange={this.themeChanged}
                    >
                      <option value={Theme.system}>{_t("preferences.theme-system-default")}</option>
                      <option value={Theme.day}>{_t("preferences.theme-day")}</option>
                      <option value={Theme.night}>{_t("preferences.theme-night")}</option>
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
}

export default (p: Omit<Props, "updateNotificationsSettings" | "setNotificationsSettingsItem">) => {
  const { updateNotificationsSettings, setNotificationsSettingsItem } = useMappedStore();

  const props = {
    setNotificationsSettingsItem,
    updateNotificationsSettings,
    global: p.global,
    activeUser: p.activeUser,
    muteNotifications: p.muteNotifications,
    unMuteNotifications: p.unMuteNotifications,
    setCurrency: p.setCurrency,
    setLang: p.setLang,
    setNsfw: p.setNsfw,
    toggleTheme: p.toggleTheme
  };

  return <Preferences {...props} />;
};
