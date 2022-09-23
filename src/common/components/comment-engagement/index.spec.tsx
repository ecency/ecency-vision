import React from "react";
import CommentEngagement from "./index"
import renderer from "react-test-renderer";


describe("Comment engagement component", () => {
    
it("Should scroll to comment section", () => {
    const component = renderer.create(<CommentEngagement />);
    const instance: any = component.getInstance();
    const scrollButton = component.root.findByProps({ id: "scroll-to-input" })
    scrollButton.props.onClick();
    expect(scrollButton).toBeFalsy; 
});
});