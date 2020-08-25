import React from "react";

import {ProfileEdit} from "./index";
import renderer from "react-test-renderer";

import {activeUserMaker} from "../../helper/test-helper";

it("(1) Default render", () => {
    const props = {
        activeUser: {
            ...activeUserMaker("foo"),
            ...{
                data: {
                    name: "foo",
                    profile: {
                        name: 'Foo B.',
                        about: 'Lorem ipsum dolor sit amet',
                        website: 'https://lipsum.com',
                        location: 'New York',
                        cover_image: 'https://www.imgur.com/cover-image.jpg',
                        profile_image: 'https://www.imgur.com/profile-image.jpg',
                    }
                }
            }
        },

        addAccount: () => {
        },
        updateActiveUser: () => {
        },
        onHide: () => {
        }
    };

    console.log(props.activeUser)

    const component = renderer.create(<ProfileEdit {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});
