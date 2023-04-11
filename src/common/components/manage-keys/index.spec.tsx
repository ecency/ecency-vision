import React from "react";
import ManageKeys from "./index";
import renderer from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
import { activeUserInstance, fullAccountInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    // accountData: {
    //   postingsAuthority: [[
    //     ["ecency.app", 1],
    //     ["esteem-app", 1],
    //     ["esteem.app", 1],
    //     ["esteemapp", 1],
    //     ["peakd.app", 1]]
    //   ],
    //   posting: ["STM6uvU7j624wCZNa2pcXvkqmbnNC1cgraDrVG3pFRhXvj9LYS7Xp", 1],
    //   owner: ["STM7F7zfd6ieangxz6uxQkYifUS5H841x5E41SYZaVc9F9cGPJ9jN", 1],
    //   active: ["STM71z4rmzGHdp7pmePZyS1G2GrbuBqg9PPHRgiK6uYqjzUTRNCRR", 1],
    //   weight: 1,
    //   memokey: "STM7rioGL7NopT2Zo446hnzAiHLp5sJ1gS55xu3NikmxfQnEznsue",
    //   account: {
    //     ...fullAccountInstance
    //   },
    //   PublicKeys: {
    //     publicOwnerKey: "STM7F7zfd6ieangxz6uxQkYifUS5H841x5E41SYZaVc9F9cGPJ9jN",
    //     publicActiveKey: "STM71z4rmzGHdp7pmePZyS1G2GrbuBqg9PPHRgiK6uYqjzUTRNCRR",
    //     publicPostingKey: "STM6uvU7j624wCZNa2pcXvkqmbnNC1cgraDrVG3pFRhXvj9LYS7Xp",
    //     publicMemoKey: "STM7rioGL7NopT2Zo446hnzAiHLp5sJ1gS55xu3NikmxfQnEznsue"
    //   }
    // },

    accountData: {
      postingsAuthority: [
        ["user1", 1],
        ["user2", 1],
        ["user3", 0]
      ],
      posting: ["demo.com", 1],
      owner: ["demo123", 1],
      active: ["ecency.app", 1],
      weight: 100,
      memokey: "memokey",
      account: {
        ...fullAccountInstance
      },
      PublicKeys: {
        publicOwnerKey: "owner_key",
        publicActiveKey: "active_key",
        publicPostingKey: "posting_key",
        publicMemoKey: "memo_key"
      }
    },
    activeUser: { ...activeUserInstance },
    history: createBrowserHistory()
  };
  const component = renderer.create(
    <BrowserRouter>
      <ManageKeys {...props} />
    </BrowserRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
