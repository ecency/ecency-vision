import sorter from "./sorter";

import { SortOrder } from "./types";

import { discussionInstace1 } from "../../helper/test-helper";

it("(1) Sort trending", () => {
  const [, ...replies] = discussionInstace1;
  sorter(replies, SortOrder.trending);

  expect(replies).toMatchSnapshot();
});

it("(2) Sort author_reputation", () => {
  const [, ...replies] = discussionInstace1;
  sorter(replies, SortOrder.author_reputation);

  expect(replies).toMatchSnapshot();
});

it("(3) Sort author_repuvotestation", () => {
  const [, ...replies] = discussionInstace1;
  sorter(replies, SortOrder.votes);

  expect(replies).toMatchSnapshot();
});

it("(4) Sort created", () => {
  const [, ...replies] = discussionInstace1;
  sorter(replies, SortOrder.created);

  expect(replies).toMatchSnapshot();
});
