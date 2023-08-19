import React, { Component } from "react";
import { Link } from "react-router-dom";
import { ActiveUser } from "../../store/active-user/types";
import ToolTip from "../tooltip";
import { _t } from "../../i18n";

import {
  gifCardSvg,
} from "../../img/svg";

import { PurchaseQrDialog } from "../purchase-qr";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import "./_index.scss";
import UserNav from "./user-nav";
import { UserNavProps } from "./types/usernav-types";

const UserNavContainer: React.FC<Pick<UserNavProps, 'history'>> = ({ history }) => {
  const {
    global,
    dynamicProps,
    users,
    ui,
    activeUser,
    notifications,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    addAccount,
    fetchNotifications,
    fetchUnreadNotificationCount,
    setNotificationsFilter,
    markNotifications,
    toggleUIProp,
    muteNotifications,
    unMuteNotifications,
    updateNotificationsSettings,
    setNotificationsSettingsItem,
  } = useMappedStore();
  const location = useLocation();

  return (
    <UserNav
      global={global}
      dynamicProps={dynamicProps}
      history={history}
      location={location}
      users={users}
      ui={ui}
      activeUser={activeUser}
      notifications={notifications}
      setActiveUser={setActiveUser}
      updateActiveUser={updateActiveUser}
      deleteUser={deleteUser}
      addAccount={addAccount}
      fetchNotifications={fetchNotifications}
      fetchUnreadNotificationCount={fetchUnreadNotificationCount}
      setNotificationsFilter={setNotificationsFilter}
      markNotifications={markNotifications}
      toggleUIProp={toggleUIProp}
      muteNotifications={muteNotifications}
      unMuteNotifications={unMuteNotifications}
      updateNotificationsSettings={updateNotificationsSettings}
      setNotificationsSettingsItem={setNotificationsSettingsItem}
    />
  );
};

export default UserNavContainer;
