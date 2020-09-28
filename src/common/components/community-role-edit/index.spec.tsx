import React from "react";

import renderer from "react-test-renderer";

import {CommunityRoleEdit} from "./index";

import {roleMap} from "../../store/communities/types";

import {communityInstance1, globalInstance, activeUserMaker} from "../../helper/test-helper";

it("(1) Render", () => {
    const props = {
        global: globalInstance,
        community: {...communityInstance1},
        activeUser: activeUserMaker("hive-148441"),
        user: 'foo',
        role: 'mod',
        roles: roleMap["owner"],
        addCommunity: () => {
        },
        onHide: () => {
        }
    };

    const component = renderer.create(<CommunityRoleEdit {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
});
