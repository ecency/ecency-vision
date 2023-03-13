import React from "react";
import ManageKeys from "./index";
import renderer from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
import { fullAccountInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    accountData: {
      postingsAuthority: [],
      posting: [],
      owner: [],
      active: [],
      weight: 0,
      memokey: "",
      account: {
        name: "user1"
      },
      PublicKeys: {
        publicOwnerKey: "",
        publicActiveKey: "",
        publicPostingKey: "",
        publicMemoKey: ""
      }
    },
    activeUser: {
      username: "foo",
      data: {
        ...fullAccountInstance,
        name: "foo"
      },
      points: {
        points: "10.000",
        uPoints: "0.000"
      }
    },
    history: createBrowserHistory()
  };
  const component = renderer.create(
    <BrowserRouter>
      <ManageKeys {...props} />
    </BrowserRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
