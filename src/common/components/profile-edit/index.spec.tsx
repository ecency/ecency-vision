import React from "react";

import ProfileEdit from "./index";

import renderer from "react-test-renderer";

import { activeUserMaker, fullAccountInstance, globalInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    global: globalInstance,
    activeUser: {
      ...activeUserMaker("foo"),
      ...{
        data: {
          ...fullAccountInstance,
          name: "foo",
          profile: {
            name: "Foo B.",
            about: "Lorem ipsum dolor sit amet",
            website: "https://lipsum.com",
            location: "New York",
            cover_image: "https://www.imgur.com/cover-image.jpg",
            profile_image: "https://www.imgur.com/profile-image.jpg"
          },
          __loaded: true
        }
      }
    },

    addAccount: () => {},
    updateActiveUser: () => {},
    onHide: () => {}
  };

  const component = renderer.create(<ProfileEdit {...props} account={fullAccountInstance} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Many social media ids", () => {
  const props = {
    global: globalInstance,
    activeUser: {
      ...activeUserMaker("foo"),
      ...{
        data: {
          ...fullAccountInstance,
          name: "foo",
          profile: {
            name: "Foo B.",
            about: "Lorem ipsum dolor sit amet",
            website: "https://lipsum.com",
            location: "New York",
            cover_image: "https://www.imgur.com/cover-image.jpg",
            profile_image: "https://www.imgur.com/profile-image.jpg"
          },
          __loaded: true
        }
      }
    },

    addAccount: () => {},
    updateActiveUser: () => {},
    onHide: () => {}
  };

  const component = renderer.create(<ProfileEdit {...props} account={fullAccountInstance} />);
  expect(component.toJSON()).toMatchSnapshot();
});
