import React from "react";

import TestRenderer from "react-test-renderer";
import { StaticRouter } from "react-router-dom";
import { createBrowserHistory } from "history";

import { SwitchLang } from "./index";

import { globalInstance } from "../../helper/test-helper";

it("(1) Default Render", () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    setLang: () => {}
  };

  const renderer = TestRenderer.create(
    <StaticRouter location="/" context={{}}>
      <SwitchLang {...props} />
    </StaticRouter>
  );
  expect(renderer.toJSON()).toMatchSnapshot();
});
