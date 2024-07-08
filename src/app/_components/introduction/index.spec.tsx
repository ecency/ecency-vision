import React from "react";
import { Introduction } from "./index";
import renderer from "react-test-renderer";

describe("Introduction component", () => {
  const props = {
    title: "Test Title",
    description: "Test decription",
    media: "https://propakistani.pk/wp-content/uploads/2019/12/Social-Media-Insight-top.png",
    onClose: () => {}
  };

  const component = renderer.create(<Introduction {...props} />);
  const instance: any = component.getInstance();

  it("(1) renders successfully with minimal props", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(3) closes on clicking close button", () => {
    component.root.findByProps({ id: "close-btn" }).props.onClick();
    expect(component.root.findByProps({ id: "close-btn" })).toBeFalsy;
  });
});
