import React from 'react';

import CommunityListItem from './index';
import TestRenderer from 'react-test-renderer';

import { createBrowserHistory } from 'history';
import { StaticRouter } from 'react-router-dom';

import { communityInstance1, UiInstance, globalInstance } from '../../helper/test-helper';

it('(1) Default render', () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    users: [],
    activeUser: null,
    community: { ...communityInstance1 },
    ui: UiInstance,
    subscriptions: [],
    setActiveUser: () => {},
    updateActiveUser: () => {},
    deleteUser: () => {},
    toggleUIProp: () => {},
    addAccount: () => {},
    updateSubscriptions: () => {}
  };

  const comp = <CommunityListItem {...props} />;

  const renderer = TestRenderer.create(
    <StaticRouter location="/@username" context={{}}>
      {comp}
    </StaticRouter>
  );

  expect(renderer.toJSON()).toMatchSnapshot();
});
