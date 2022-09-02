import React from "react";

import { OpenOrders } from "./index";

import TestRenderer from "react-test-renderer";

import { activeUserInstance, allOver, globalInstance } from "../../helper/test-helper";

it("(1) Open orders render default", async () => {
  const props = {
    data: [
      {
        id: 123,
        created: "string",
        expiration: "string",
        seller: "string",
        orderid: 232,
        for_sale: 543,
        sell_price: {
          base: "string",
          quote: "string"
        },
        real_price: "string",
        rewarded: true
      }
    ],
    loading: false,
    username: "string",
    activeUser: activeUserInstance,
    onTransactionSuccess: () => {}
  };

  const renderer = await TestRenderer.create(<OpenOrders {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
