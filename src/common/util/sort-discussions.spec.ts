import { discussionInstace1, entryInstance1 } from "../helper/test-helper";
import { sortDiscussions } from "./sort-discussions";
import { SortOrder } from "../store/discussion/types";

it("(1) Sort trending", () => {
  const [, ...replies] = discussionInstace1;
  sortDiscussions(entryInstance1, replies, SortOrder.trending);

  expect(replies).toMatchSnapshot();
});

it("(2) Sort author_reputation", () => {
  const [, ...replies] = discussionInstace1;
  sortDiscussions(entryInstance1, replies, SortOrder.author_reputation);

  expect(replies).toMatchSnapshot();
});

it("(3) Sort author_repuvotestation", () => {
  const [, ...replies] = discussionInstace1;
  sortDiscussions(entryInstance1, replies, SortOrder.votes);

  expect(replies).toMatchSnapshot();
});

it("(4) Sort created", () => {
  const [, ...replies] = discussionInstace1;
  sortDiscussions(entryInstance1, replies, SortOrder.created);

  expect(replies).toMatchSnapshot();
});
