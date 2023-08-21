import { Account } from "../../../store/accounts/types";
import { ActiveUser } from "../../../store/active-user/types";
import { DynamicProps } from "../../../store/dynamic-props/types";
import { updateNotificationsSettings, setNotificationsSettingsItem } from "../../../store/notifications";
import { NotificationFilter, Notifications } from "../../../store/notifications/types";
import { UI, ToggleType } from "../../../store/ui/types";
import { User } from "../../../store/users/types";
import { History, Location } from "history";
import { Global } from "../../../store/global/types";

export interface UserNavProps {
    global: Global;
    dynamicProps: DynamicProps;
    history: History;
    location: Location;
    users: User[];
    ui: UI;
    activeUser: ActiveUser;
    notifications: Notifications;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    addAccount: (data: Account) => void;
    fetchNotifications: (since: string | null) => void;
    fetchUnreadNotificationCount: () => void;
    setNotificationsFilter: (filter: NotificationFilter | null) => void;
    markNotifications: (id: string | null) => void;
    toggleUIProp: (what: ToggleType) => void;
    muteNotifications: () => void;
    unMuteNotifications: () => void;
    updateNotificationsSettings: typeof updateNotificationsSettings;
    setNotificationsSettingsItem: typeof setNotificationsSettingsItem;
    icon?: JSX.Element;
  }
  