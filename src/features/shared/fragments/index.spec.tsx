import * as React from "react";
import renderer from "react-test-renderer";

import { activeUserInstance, allOver, fullAccountInstance } from "../../helper/test-helper";
import { Fragments } from "@/features/shared/fragments/fragments-list";
import { AddFragment } from "@/features/shared/fragments/add-fragment";
import { EditFragment } from "@/features/shared/fragments/edit-fragment";

let TEST_MODE = 0;

jest.mock("../../api/private-api", () => ({
  getFragments: () =>
    new Promise((resolve) => {
      if (TEST_MODE === 0) {
        resolve([]);
      }

      if (TEST_MODE === 1) {
        resolve([
          {
            id: "id1",
            title: "foo",
            body: "lorem ipsum dolor sit amet",
            created: "2020-10-10T10:00:00",
            modified: "2020-10-10T10:00:00"
          },
          {
            id: "id2",
            title: "bar",
            body: "lorem ipsum dolor sit amet",
            created: "2020-10-10T10:00:00",
            modified: "2020-10-10T10:00:00"
          },
          {
            id: "id3",
            title: "baz",
            body: "lorem ipsum dolor sit amet",
            created: "2020-10-10T10:00:00",
            modified: "2020-10-10T10:00:00"
          }
        ]);
      }
    })
}));

const activeUser = { ...activeUserInstance, data: fullAccountInstance };

it("(1) Default render.", async () => {
  const props = {
    activeUser: { ...activeUser },
    onHide: () => {}
  };

  const component = renderer.create(<Fragments {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) With data.", async () => {
  TEST_MODE = 1;

  const props = {
    activeUser: { ...activeUser },
    onHide: () => {}
  };

  const component = renderer.create(<Fragments {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Add", async () => {
  const props = {
    activeUser: { ...activeUser },
    onAdd: () => {},
    onCancel: () => {}
  };

  const component = renderer.create(<AddFragment {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) Edit", async () => {
  const props = {
    activeUser: { ...activeUser },
    item: {
      id: "id3",
      title: "baz",
      body: "lorem ipsum dolor sit amet",
      created: "2020-10-10T10:00:00",
      modified: "2020-10-10T10:00:00"
    },
    onUpdate: () => {},
    onCancel: () => {}
  };

  const component = renderer.create(<EditFragment {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
