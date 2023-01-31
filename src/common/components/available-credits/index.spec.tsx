import React from "react";
import renderer from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";
import { AvailableCredits } from "./index";
import { RcOperation } from "../../api/hive";
import { flushPending } from "../../helper/test-helper";

it("(1) Default render", async () => {
  const props = {
    username: "test",
    operation: "comment_operation" as RcOperation,
    activeUser: {} as any,
    location: {} as any
  };
  const component = renderer.create(
    <BrowserRouter>
      <AvailableCredits {...props} />
    </BrowserRouter>
  );
  await flushPending();
  expect(component.toJSON()).toMatchSnapshot();
});
