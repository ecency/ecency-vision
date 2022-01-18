import React from 'react';
import { StaticRouter } from 'react-router-dom';

import { createBrowserHistory, createLocation } from 'history';

import UserNav from './index';
import renderer from 'react-test-renderer';

import {
  notificationsInstance1,
  UiInstance,
  globalInstance,
  fullAccountInstance,
  dynamicPropsIntance1
} from '../../helper/test-helper';

const defProps = {
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  history: createBrowserHistory(),
  location: createLocation({}),
  users: [],
  ui: UiInstance,
  activeUser: {
    username: 'foo',
    data: {
      name: 'foo'
    },
    points: {
      points: '0.000',
      uPoints: '0.000'
    }
  },
  notifications: notificationsInstance1,
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  addAccount: () => {},
  fetchNotifications: () => {},
  fetchUnreadNotificationCount: () => {},
  setNotificationsFilter: () => {},
  markNotifications: () => {},
  toggleUIProp: () => {},
  muteNotifications: () => {},
  unMuteNotifications: () => {}
};

it('(1) Default render', () => {
  const component = renderer.create(
    <StaticRouter location="/@username" context={{}}>
      <UserNav {...defProps} />
    </StaticRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});

it('(2) Has rewards ', () => {
  const props = {
    ...defProps,
    ...{
      activeUser: {
        username: 'foo',
        data: {
          ...fullAccountInstance,
          name: 'foo',
          reward_hbd_balance: '0.000 HBD',
          reward_steem_balance: '0.000 HIVE',
          reward_vesting_hive: '10.207 HIVE'
        },
        points: {
          points: '0.000',
          uPoints: '1.500'
        }
      }
    }
  };

  const component = renderer.create(
    <StaticRouter location="/@username" context={{}}>
      <UserNav {...props} />
    </StaticRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});

it('(3) usePrivate = false', () => {
  const props = {
    ...defProps,
    global: {
      ...globalInstance,
      usePrivate: false
    }
  };

  const component = renderer.create(
    <StaticRouter location="/@username" context={{}}>
      <UserNav {...props} />
    </StaticRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
