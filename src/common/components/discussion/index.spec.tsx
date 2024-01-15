import React from "react";
import { Discussion } from "./index";
import { createBrowserHistory, createLocation } from "history";
import {
  activeUserMaker,
  allOver,
  discussionInstace1,
  dynamicPropsIntance1,
  globalInstance,
  UiInstance
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";
import { queryClient, QueryIdentifiers } from "../../core";
import { QueryClientProvider } from "@tanstack/react-query";
import { StaticRouter } from "react-router-dom";

jest.mock("moment", () => () => ({
  fromNow: () => "3 days ago",
  format: (f: string, s: string) => "2020-01-01 23:12:00"
}));

const [parent] = discussionInstace1;
const [, ...replies] = discussionInstace1;

const defProps = {
  history: createBrowserHistory(),
  location: createLocation({}),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  users: [],
  activeUser: activeUserMaker("foo"),
  ui: UiInstance,
  parent,
  community: null,
  isRawContent: false,
  addAccount: () => {},
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  addReply: () => {},
  toggleUIProp: () => {},
  hideControls: false
};

describe("Discussions", () => {
  afterEach(() => {
    queryClient.setQueryData(
      [QueryIdentifiers.FETCH_DISCUSSIONS, parent.author, parent.permlink],
      []
    );
  });

  it("(1) Full render with active user", async () => {
    queryClient.setQueryData(
      [QueryIdentifiers.FETCH_DISCUSSIONS, parent.author, parent.permlink],
      replies
    );
    // render the component
    let component = withStore(
      <StaticRouter location="/" context={{}}>
        <QueryClientProvider client={queryClient}>
          <Discussion {...defProps} />
        </QueryClientProvider>
      </StaticRouter>
    );
    await allOver();
    // make assertions on component
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(2) Full render with no active user", async () => {
    queryClient.setQueryData(
      [QueryIdentifiers.FETCH_DISCUSSIONS, parent.author, parent.permlink],
      replies
    );
    const props = {
      ...defProps,
      activeUser: null
    };
    // render the component
    let component = withStore(
      <StaticRouter location="/" context={{}}>
        <QueryClientProvider client={queryClient}>
          <Discussion {...props} />
        </QueryClientProvider>
      </StaticRouter>
    );
    await allOver();
    // make assertions on component
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(3) With selected item", async () => {
    const props = {
      ...defProps,
      location: createLocation({ hash: "#@forykw/re-esteemapp-202067t12246786z" })
    };
    queryClient.setQueryData(
      [QueryIdentifiers.FETCH_DISCUSSIONS, parent.author, parent.permlink],
      replies
    );
    // render the component
    let component = withStore(
      <StaticRouter location="/" context={{}}>
        <QueryClientProvider client={queryClient}>
          <Discussion {...props} />
        </QueryClientProvider>
      </StaticRouter>
    );
    await allOver();
    // make assertions on component
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(5) Empty list with no active user", async () => {
    // render the component
    let component = withStore(
      <StaticRouter location="/" context={{}}>
        <QueryClientProvider client={queryClient}>
          <Discussion {...defProps} />
        </QueryClientProvider>
      </StaticRouter>
    );
    await allOver();
    // make assertions on component
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(6) Empty list with active user", async () => {
    const props = {
      ...defProps,
      activeUser: activeUserMaker("foo")
    };
    // render the component
    let component = withStore(
      <StaticRouter location="/" context={{}}>
        <QueryClientProvider client={queryClient}>
          <Discussion {...props} />
        </QueryClientProvider>
      </StaticRouter>
    );
    await allOver();
    // make assertions on component
    expect(component.toJSON()).toMatchSnapshot();
  });
});
