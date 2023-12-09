import defaults from "@/defaults.json";
import { ActiveUser, WsNotification } from "@/entities";
import { NotifyTypes } from "@/enums";
import i18next from "i18next";
import { playNotificationSound, requestNotificationPermission } from "@/utils";

declare var window: Window & {
  nws?: WebSocket;
};

export class NotificationsWebSocket {
  private activeUser: ActiveUser | null = null;
  private hasNotifications = false;
  private hasUiNotifications = false;
  private onSuccessCallbacks: Function[] = [];
  private enabledNotifyTypes: NotifyTypes[] = [];
  private isConnected = false;

  private static getBody(data: WsNotification) {
    const { source } = data;
    switch (data.type) {
      case "vote":
        return i18next.t("notification.voted", { source });
      case "mention":
        return data.extra.is_post === 1
          ? i18next.t("notification.mention-post", { source })
          : i18next.t("notification.mention-comment", { source });
      case "favorites":
        return i18next.t("notification.favorite", { source });
      case "bookmarks":
        return i18next.t("notification.bookmark", { source });
      case "follow":
        return i18next.t("notification.followed", { source });
      case "reply":
        return i18next.t("notification.replied", { source });
      case "reblog":
        return i18next.t("notification.reblogged", { source });
      case "transfer":
        return i18next.t("notification.transfer", { source, amount: data.extra.amount });
      case "delegations":
        return i18next.t("notification.delegations", { source, amount: data.extra.amount });
      default:
        return "";
    }
  }

  public async connect() {
    if (this.isConnected) {
      return;
    }

    if (!this.activeUser) {
      this.disconnect();
      return;
    }

    if (window.nws !== undefined) {
      return;
    }

    if ("Notification" in window) {
      await requestNotificationPermission();
    }

    window.nws = new WebSocket(`${defaults.nwsServer}/ws?user=${this.activeUser.username}`);
    window.nws.onopen = () => {
      console.log("nws connected");
      this.isConnected = true;
    };
    window.nws.onmessage = (e) => this.onMessageReceive(e);
    window.nws.onclose = (evt: CloseEvent) => {
      console.log("nws disconnected");

      window.nws = undefined;

      if (!evt.wasClean) {
        // Disconnected due connection error
        console.log("nws trying to reconnect");

        setTimeout(() => {
          this.connect();
        }, 2000);
      }
    };
  }

  public disconnect() {
    if (window.nws !== undefined && this.isConnected) {
      window.nws.close();
      window.nws = undefined;
      this.isConnected = false;
    }
  }

  public withActiveUser(activeUser: ActiveUser | null) {
    this.activeUser = activeUser;
    return this;
  }

  public withToggleUi(toggle: Function) {
    this.toggleUiProp = toggle;
    return this;
  }

  public setHasNotifications(has: boolean) {
    this.hasNotifications = has;
    return this;
  }

  public withCallbackOnMessage(cb: Function) {
    this.onSuccessCallbacks.push(cb);
    return this;
  }

  public setHasUiNotifications(has: boolean) {
    this.hasUiNotifications = has;
    return this;
  }

  public setEnabledNotificationsTypes(value: NotifyTypes[]) {
    this.enabledNotifyTypes = value;
    return this;
  }

  public getNotificationType(value: string): NotifyTypes | null {
    switch (value) {
      case "vote":
        return NotifyTypes.VOTE;
      case "mention":
        return NotifyTypes.MENTION;
      case "follow":
        return NotifyTypes.FOLLOW;
      case "reply":
        return NotifyTypes.COMMENT;
      case "reblog":
        return NotifyTypes.RE_BLOG;
      case "transfer":
        return NotifyTypes.TRANSFERS;
      default:
        return null;
    }
  }

  private toggleUiProp: Function = () => {};

  private async playSound() {
    if (!("Notification" in window)) {
      return;
    }
    const permission = await requestNotificationPermission();
    if (permission !== "granted") return;

    playNotificationSound();
  }

  private async onMessageReceive(evt: MessageEvent) {
    const logo = require("../assets/img/logo-circle.svg");

    const data = JSON.parse(evt.data);
    const msg = NotificationsWebSocket.getBody(data);

    const messageNotifyType = this.getNotificationType(data.type);
    const allowedToNotify =
      messageNotifyType && this.enabledNotifyTypes.length > 0
        ? this.enabledNotifyTypes.includes(messageNotifyType)
        : true;

    if (msg) {
      this.onSuccessCallbacks.forEach((cb) => cb());
      if (!this.hasNotifications || !allowedToNotify) {
        return;
      }

      await this.playSound();

      new Notification(i18next.t("notification.popup-title"), { body: msg, icon: logo }).onclick =
        () => {
          if (!this.hasUiNotifications) {
            this.toggleUiProp("notifications");
          }
        };
    }
  }
}
