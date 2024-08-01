import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ClickAwayListener } from "@/features/shared";

describe("ClickAwayListener", () => {
  let onClickAwayMock;

  beforeEach(() => {
    onClickAwayMock = jest.fn();
    jest.clearAllMocks();
  });

  test("renders children correctly", () => {
    render(
      <ClickAwayListener onClickAway={onClickAwayMock}>
        <div>Inside Content</div>
      </ClickAwayListener>
    );

    expect(screen.getByText("Inside Content")).toBeInTheDocument();
  });

  test("calls onClickAway when clicking outside", () => {
    const { container } = render(
      <div>
        <ClickAwayListener onClickAway={onClickAwayMock}>
          <div>Inside Content</div>
        </ClickAwayListener>
        <div>Outside Content</div>
      </div>
    );

    // Simulate a click outside the ClickAwayListener component
    fireEvent.mouseDown(screen.getByText("Outside Content"));

    expect(onClickAwayMock).toHaveBeenCalledTimes(1);
  });

  test("does not call onClickAway when clicking inside", () => {
    render(
      <ClickAwayListener onClickAway={onClickAwayMock}>
        <div>Inside Content</div>
      </ClickAwayListener>
    );

    // Simulate a click inside the component
    fireEvent.mouseDown(screen.getByText("Inside Content"));

    expect(onClickAwayMock).not.toHaveBeenCalled();
  });
});
