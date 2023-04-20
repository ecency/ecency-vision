import React from "react";
import ManageKeys from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";
import { activeUserInstance, fullAccountInstance } from "../../helper/test-helper";
import { AccountDataType } from "../manage-authority/types";

it("(1) Default render", () => {
  const postingsAuthority: AccountDataType["postingsAuthority"] = [
    ["ecency.app", 1],
    ["esteem-app", 1],
    ["esteem.app", 1],
    ["esteemapp", 1],
    ["peakd.app", 1]
  ];
  const posting: AccountDataType["posting"] = [
    "STM6uvU7j624wCZNa2pcXvkqmbnNC1cgraDrVG3pFRhXvj9LYS7Xp",
    1
  ];
  const owner: AccountDataType["owner"] = [
    "STM7F7zfd6ieangxz6uxQkYifUS5H841x5E41SYZaVc9F9cGPJ9jN",
    1
  ];
  const active: AccountDataType["active"] = [
    "STM71z4rmzGHdp7pmePZyS1G2GrbuBqg9PPHRgiK6uYqjzUTRNCRR",
    1
  ];
  const props = {
    accountData: {
      postingsAuthority: postingsAuthority,
      posting: posting,
      owner: owner,
      active: active,
      weight: 100,
      memokey: "STM7rioGL7NopT2Zo446hnzAiHLp5sJ1gS55xu3NikmxfQnEznsue",
      account: {
        ...fullAccountInstance
      },
      publicKeys: {
        publicOwnerKey: "owner_key",
        publicActiveKey: "active_key",
        publicPostingKey: "posting_key",
        publicMemoKey: "memo_key"
      }
    },
    activeUser: { ...activeUserInstance },
    history: createBrowserHistory()
  };
  const component = renderer.create(<ManageKeys {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
