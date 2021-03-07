import React from "react";

import {InfoContent} from "./index";
import renderer from "react-test-renderer";

import {fullAccountInstance, dynamicPropsIntance1, RcAccountInstance, allOver} from "../../helper/test-helper";

const defProps = {
    account: fullAccountInstance,
    dynamicProps: dynamicPropsIntance1,
    rcAccount: RcAccountInstance
};

it("(1) Render", () => {
    const component = renderer.create(<InfoContent {...defProps} />);
    expect(component.toJSON()).toMatchSnapshot();
});



