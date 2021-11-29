import React from "react";

import ResizableTextArea from "./index";
import renderer from "react-test-renderer";

const longText = "ResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextAreaResizableTextArea"
const props = {
    id:"the-editor-xs",
    className: "the-editor accepts-emoji form-control",
    minRows: 1,
    maxRows: 100,
    value: longText
};


const component = renderer.create(<div style={{ width: 300 }}><ResizableTextArea {...props} /></div>);

it("(1) Default render", () => {
    expect(component.toJSON()).toMatchSnapshot();
});

it("(2) With correct value", () => {
    const instance: any = component.getInstance();
    expect(component.root.findByProps({id: props.id}).props.value).toContain(longText);
});
