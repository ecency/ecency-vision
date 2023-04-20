import React from "react";

import TestRenderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { dynamicPropsIntance1, globalInstance } from "../../helper/test-helper";

import NotificationListItem from "./notification-list-item";

import {
  apiVoteNotification,
  apiMentionNotification,
  apiFollowNotification,
  apiUnfollowNotification,
  apiReplyNotification,
  apiReblogNotification,
  apiTransferNotification
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

describe("(1) NotificationListItem", () => {
  const defProps = {
    global: globalInstance,
    history: createBrowserHistory(),
    dynamicProps: dynamicPropsIntance1,
    isSelect: false,
    currentStatus: "",
    markNotifications: () => {},
    addAccount: () => {},
    toggleUIProp: () => {},
    setSelectedNotifications: () => {}
  };

  it("(1) Vote ", () => {
    const props = { ...defProps, notification: apiVoteNotification };
    const renderer = withStore(<NotificationListItem {...props} />);

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(2) Mention ", () => {
    const props = { ...defProps, notification: apiMentionNotification };
    const renderer = withStore(<NotificationListItem {...props} />);

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(3) Follow ", () => {
    const props = { ...defProps, notification: apiFollowNotification };
    const renderer = withStore(<NotificationListItem {...props} />);

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(4) Unfollow ", () => {
    const props = { ...defProps, notification: apiUnfollowNotification };
    const renderer = withStore(<NotificationListItem {...props} />);

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(5) Reply ", () => {
    const props = { ...defProps, notification: apiReplyNotification };
    const renderer = withStore(<NotificationListItem {...props} />);

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(6) Reblog ", () => {
    const props = { ...defProps, notification: apiReblogNotification };
    const renderer = withStore(<NotificationListItem {...props} />);

    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(7) Transfer ", () => {
    const props = { ...defProps, notification: apiTransferNotification };
    const renderer = withStore(<NotificationListItem {...props} />);

    expect(renderer.toJSON()).toMatchSnapshot();
  });
});
