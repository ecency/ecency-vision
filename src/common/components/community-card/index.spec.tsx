import React from "react";

import CommunityCard from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

const community = {
  id: 1369030,
  name: "hive-148441",
  title: "GEMS",
  about:
    "To highlight true Gems of Hive community with User Retention as primary objective.",
  lang: "en",
  type_id: 1,
  is_nsfw: false,
  subscribers: 4086,
  sum_pending: 17370,
  num_pending: 12481,
  num_authors: 1796,
  created_at: "2020-02-26 11:33:33",
  avatar_url: "",
  context: {},
  description:
    "This is a collective curation community formed by @appreciator, @rocky1 and @upmewhale. You can post your genuine and creative content in this community to get more support.\n\n\nYou can post in languages other than English.\n\nThere are not many restrictions but just few simple ones and we expect you to adhere to them\n\nJoin our discord group to keep yourself updated:\nhttps://discord.gg/n98Kpmm",
  flag_text:
    "Plagiarism will be highly discouraged.\nHate Speech is not allowed",
  settings: {},
  team: [
    ["hive-148441", "owner", ""],
    ["bluemist", "admin", ""],
  ],
};

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    community,
  };

  const component = renderer.create(<CommunityCard {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
