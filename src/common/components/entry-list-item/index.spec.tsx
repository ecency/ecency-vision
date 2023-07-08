import React from "react";

import { createBrowserHistory, createLocation } from "history";

import mockDate from "mockdate";

import { StaticRouter } from "react-router-dom";

import {
  globalInstance,
  dynamicPropsIntance1,
  entryInstance1,
  UiInstance,
  emptyReblogs,
  allOver,
  crossEntryInstance
} from "../../helper/test-helper";

import { ListStyle } from "../../store/global/types";

import EntryListItem from "./index";
import { withStore } from "../../tests/with-store";
import { activeUserMaker } from "../../store/helper";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../core";

mockDate.set(1591398131176);

const defProps = {
  history: createBrowserHistory(),
  location: createLocation({}),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  communities: [],
  community: null,
  users: [],
  activeUser: null,
  reblogs: emptyReblogs,
  entry: entryInstance1,
  ui: UiInstance,
  signingKey: "",
  asAuthor: "",
  promoted: false,
  order: 0,
  addAccount: () => {},
  updateEntry: () => {},
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  fetchReblogs: () => {},
  addReblog: () => {},
  deleteReblog: () => {},
  toggleUIProp: () => {},
  addCommunity: () => {},
  trackEntryPin: () => {},
  setSigningKey: () => {},
  setEntryPin: () => {}
};

it("(1) Default render", async () => {
  const renderer = await withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <EntryListItem {...defProps} />
      </StaticRouter>
    </QueryClientProvider>,
    defProps
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Grid view", async () => {
  const props = {
    ...defProps,
    global: {
      ...globalInstance,
      listStyle: ListStyle.grid
    }
  };
  const renderer = await withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <EntryListItem {...props} />
      </StaticRouter>
    </QueryClientProvider>,
    defProps
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
it("(3) Nsfw", async () => {
  const props = {
    ...defProps,
    entry: {
      ...entryInstance1,
      json_metadata: {
        ...entryInstance1.json_metadata,
        tags: [...(entryInstance1.json_metadata.tags ?? []), "nsfw"]
      }
    }
  };
  const renderer = await withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <EntryListItem {...props} />
      </StaticRouter>
    </QueryClientProvider>,
    defProps
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) Nsfw with active user", async () => {
  const props = {
    ...defProps,
    entry: {
      ...entryInstance1,
      json_metadata: {
        ...entryInstance1.json_metadata,
        tags: [...(entryInstance1.json_metadata.tags ?? []), "nsfw"]
      }
    },
    activeUser: activeUserMaker("foo")
  };
  const renderer = await withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <EntryListItem {...props} />
      </StaticRouter>
    </QueryClientProvider>,
    defProps
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(5) Nsfw but allowed", async () => {
  const props = {
    ...defProps,
    entry: {
      ...entryInstance1,
      json_metadata: {
        ...entryInstance1.json_metadata,
        tags: [...(entryInstance1.json_metadata.tags ?? []), "nsfw"]
      }
    },
    global: {
      ...globalInstance,
      nsfw: true
    }
  };
  const renderer = await withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <EntryListItem {...props} />
      </StaticRouter>
    </QueryClientProvider>,
    defProps
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(6) Cross post. Bottom menu", async () => {
  const props = {
    ...defProps,
    entry: crossEntryInstance,
    order: 2
  };

  const renderer = await withStore(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location="/" context={{}}>
        <EntryListItem {...props} />
      </StaticRouter>
    </QueryClientProvider>,
    defProps
  );
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
