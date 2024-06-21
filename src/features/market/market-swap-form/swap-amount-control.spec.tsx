import { MarketAsset } from "./market-pair";
import renderer from "react-test-renderer";
import React from "react";
import { Props, SwapAmountControl } from "./swap-amount-control";

describe("SwapAmountControl", function () {
  it("should render correctly", function () {
    const props: Props = {
      value: "",
      setValue: jest.fn(),
      labelKey: "",
      asset: MarketAsset.HIVE,
      availableAssets: [MarketAsset.HIVE],
      setAsset: jest.fn(),
      usdRate: 1,
      disabled: false
    };
    const component = renderer.create(<SwapAmountControl {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should set className", function () {
    const props: Props = {
      className: "test",
      value: "",
      setValue: jest.fn(),
      labelKey: "",
      asset: MarketAsset.HIVE,
      availableAssets: [MarketAsset.HIVE],
      setAsset: jest.fn(),
      usdRate: 1,
      disabled: false
    };
    const component = renderer.create(<SwapAmountControl {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render label", function () {
    const props: Props = {
      value: "",
      setValue: jest.fn(),
      labelKey: "Test",
      asset: MarketAsset.HIVE,
      availableAssets: [MarketAsset.HIVE],
      setAsset: jest.fn(),
      usdRate: 1,
      disabled: false
    };
    const component = renderer.create(<SwapAmountControl {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render disabled state", function () {
    const props: Props = {
      value: "",
      setValue: jest.fn(),
      labelKey: "",
      asset: MarketAsset.HIVE,
      availableAssets: [MarketAsset.HIVE],
      setAsset: jest.fn(),
      usdRate: 1,
      disabled: true
    };
    const component = renderer.create(<SwapAmountControl {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render balance showing", function () {
    const props: Props = {
      value: "",
      setValue: jest.fn(),
      labelKey: "",
      asset: MarketAsset.HIVE,
      availableAssets: [MarketAsset.HIVE],
      setAsset: jest.fn(),
      usdRate: 1,
      disabled: false,
      showBalance: true,
      balance: "test balance"
    };
    const component = renderer.create(<SwapAmountControl {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should be able to render element after balance", function () {
    const props: Props = {
      value: "",
      setValue: jest.fn(),
      labelKey: "",
      asset: MarketAsset.HIVE,
      availableAssets: [MarketAsset.HIVE],
      setAsset: jest.fn(),
      usdRate: 1,
      disabled: false,
      elementAfterBalance: <div>test</div>,
      balance: "test",
      showBalance: true
    };
    const component = renderer.create(<SwapAmountControl {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should be able to show available assets list", function () {
    const props: Props = {
      value: "",
      setValue: jest.fn(),
      labelKey: "",
      asset: MarketAsset.HIVE,
      availableAssets: [MarketAsset.HIVE, MarketAsset.HBD],
      setAsset: jest.fn(),
      usdRate: 1,
      disabled: false
    };
    const component = renderer.create(<SwapAmountControl {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
