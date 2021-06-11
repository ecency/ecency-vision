import React from "react";
import ClickAwayListener from "./index";
import TestRenderer from "react-test-renderer";


it("(1) triggers onClickAway", async () => {
    const onClickaway = () => {
        return null
    }
    let ComponentToTest = () => 
    <div>
        <button id="outside">press me to trigger clickaway!</button>
        <ClickAwayListener onClickAway={onClickaway}>
            <button id="inside" onClick={()=>{}}>I'm inside</button>
        </ClickAwayListener>
    </div>

    const renderer = TestRenderer.create(<ComponentToTest />);
    renderer.root.findByProps({ id: "inside" }).props.onClick();
    expect(renderer.root.findByProps({ id: "inside" })).toBeFalsy;
});
