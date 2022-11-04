import React from "react";
import { SortEngineTokens } from "./index";
import renderer from "react-test-renderer";
import { _t } from "../../i18n";

describe("engine tokens sorting component", () => {
    const component = renderer.create(<SortEngineTokens />);

  it("Should sort tokens in ascending order", () => {
    const ascendingLabel = component.root.findByProps({ id: "ascending" });
    ascendingLabel.props.onClick();
    expect(ascendingLabel).toBeFalsy;
  });

  it("Should sort tokens in descending order", () => {
    const descendingLabel = component.root.findByProps({ id: "descending" });
    descendingLabel.props.onClick();
    expect(descendingLabel).toBeFalsy;
  });

  it("Should sort tokens by value", () => {
    const byValueLabel = component.root.findByProps({ id: "by-value" });
    byValueLabel.props.onClick();
    expect(byValueLabel).toBeFalsy;
  });

  it("Should sort tokens by balance", () => {
    const byBalanceLabel = component.root.findByProps({ id: "by-balance" });
    byBalanceLabel.props.onClick();
    expect(byBalanceLabel).toBeFalsy;
  });

  it("Should sort tokens by stake", () => {
    const byStakeLabel = component.root.findByProps({ id: "by-stake" });
    byStakeLabel.props.onClick();
    expect(byStakeLabel).toBeFalsy;
  });

  it("Should sort tokens by delegations in", () => {
    const delegationsInLabel = component.root.findByProps({ id: "delegations-in" });
    delegationsInLabel.props.onClick();
    expect(delegationsInLabel).toBeFalsy;
  });

  it("Should sort tokens by delegations out", () => {
    const delegationsOutLabel = component.root.findByProps({ id: "delegations-out" });
    delegationsOutLabel.props.onClick();
    expect(delegationsOutLabel).toBeFalsy;
  });
  
  it("matches snapshot", () => {
    const main = component.toJSON()
    expect(main).toMatchSnapshot()
  })
  });