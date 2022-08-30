import React from "react";

import { Orders } from "./index";

import TestRenderer from "react-test-renderer";

import { allOver } from "../../helper/test-helper";

it("(1) Orders render default", async () => {
  const props = {
    loading: false,
    data: [
      {
        created: "string",
        hbd: 123,
        hive: 321,
        order_price: {
          base: "string",
          quote: "string"
        },
        real_price: "string"
      }
    ]
  };

  const renderer = await TestRenderer.create(<Orders {...props} type={1} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
