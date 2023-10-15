import React, { Fragment, useEffect, useState } from "react";
import { _t } from "../../i18n";
import "./_index.scss";
import { getCommunities, getSubscriptions } from "../../api/bridge";
import { Community } from "../../store/communities/types";
import LinearProgress from "../linear-progress";
import CommunityListItem from "../community-list-item";
import { History } from "history";
import { Global } from "../../store/global/types";
import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Subscription } from "../../store/subscriptions/types";
import { Account } from "../../store/accounts/types";

interface Props {
  history: History;
  global: Global;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  subscriptions: Subscription[];
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  addAccount: (data: Account) => void;
  updateSubscriptions: (list: Subscription[]) => void;
}

export const TopCommunitiesWidget = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<Community[]>([]);

  useEffect(() => {
    fetch();
    fetchUserSubscriptions();
  }, []);

  const fetch = async () => {
    setLoading(true);

    try {
      const response = await getCommunities("", 10, null, "rank");
      if (response) {
        setList(setRandomItems(response));
      }
    } finally {
      setLoading(false);
    }
  };

  const setRandomItems = (items: Community[]): Community[] => {
    const result: Community[] = [];
    while (result.length < 5) {
      const index = Math.floor(Math.random() * (items.length - 1));
      if (result.every((item) => items[index].id !== item.id)) {
        result.push(items[index]);
      }
    }
    return result;
  };

  const fetchUserSubscriptions = async () => {
    const { activeUser, subscriptions, updateSubscriptions } = props;
    if (activeUser && subscriptions.length === 0) {
      const response = await getSubscriptions(activeUser.username);
      if (response) {
        updateSubscriptions(response);
      }
    }
  };

  return (
    <div className="top-communities-widget">
      <div className="top-communities-widget-header">
        <div className="title flex items-center">{_t("top-communities.title")}</div>
        {loading && <LinearProgress />}
        <div className="list-items">
          {list.length === 0 && !loading && (
            <div className="no-results">{_t("communities.no-results")}</div>
          )}
          {list.map((x, i) => (
            <Fragment key={i}>
              {CommunityListItem({
                ...props,
                community: x,
                small: true
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
