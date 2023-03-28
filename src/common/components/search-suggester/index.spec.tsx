import React from "react";
import SearchSuggester from "./index";
import renderer from "react-test-renderer";
import { BrowserRouter } from "react-router-dom";
import { createBrowserHistory, createLocation } from "history";
import { globalInstance, TrendingTagsInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    location: createLocation({}),
    global: globalInstance,
    trendingTags: TrendingTagsInstance,
    value: "",
    children: <a>Search</a>,
    containerClassName: "",
    changed: false
  };
  const component = renderer.create(
    <BrowserRouter>
      <SearchSuggester {...props} />
    </BrowserRouter>
  );
  expect(component.toJSON()).toMatchSnapshot();
});
