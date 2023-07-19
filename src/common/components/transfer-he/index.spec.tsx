import React from "react";

import { Transfer, TransferMode } from "./index";

import { initialState as transactionsInitialState } from "../../store/transactions/index";

import {
  dynamicPropsIntance1,
  fullAccountInstance,
  globalInstance
} from "../../helper/test-helper";

import { ReactTestInstance } from "react-test-renderer";
import { withStore } from "../../tests/with-store";

jest.mock("moment", () => () => ({
  fromNow: () => "in 5 days"
}));

const defProps = {
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  users: [],
  account: {
    name: "user1"
  },
  activeUser: {
    username: "foo",
    data: {
      ...fullAccountInstance,
      name: "foo"
    },
    points: {
      points: "10.000",
      uPoints: "0.000"
    }
  },
  transactions: transactionsInitialState,
  signingKey: "",
  totalDelegated: "",
  addAccount: () => {},
  updateActiveUser: () => {},
  setSigningKey: () => {},
  updateWalletValues: () => {},
  onHide: () => {}
};

describe("(1) Hive Engine - Transfer", () => {
  const mode: TransferMode = "transfer";
  const asset: string = "";
  const assetBalance: number = 0.0;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = withStore(<Transfer {...props} />);
  const instance: any = (component.root.children[0] as ReactTestInstance).instance;

  it("(1) Step 1", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(2) Step 2", () => {
    instance.setState({ step: 2, to: "bar" });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(3) Step 3", () => {
    instance.setState({ step: 3 });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(4) Step 4", () => {
    instance.setState({ step: 4 });
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("(2) Hive Engine - Delegate", () => {
  const mode: TransferMode = "delegate";
  const asset: string = "";
  const assetBalance: number = 0.0;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = withStore(<Transfer {...props} />);
  const instance: any = (component.root.children[0] as ReactTestInstance).instance;

  it("(1) Step 1", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(2) Step 2", () => {
    instance.setState({ step: 2, to: "bar", memo: "HE - Delegate" });
    expect(component.toJSON()).toMatchSnapshot();
  });

  // No need to test step3 anymore

  it("(4) Step 4", () => {
    instance.setState({ step: 4 });
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("(3) Hive Engine - Undelegate", () => {
  const mode: TransferMode = "undelegate";
  const asset: string = "";
  const assetBalance: number = 0.0;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = withStore(<Transfer {...props} />);
  const instance: any = (component.root.children[0] as ReactTestInstance).instance;

  it("(1) Step 1", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(2) Step 2", () => {
    instance.setState({ step: 2, to: "bar" });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(4) Step 4", () => {
    instance.setState({ step: 4 });
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("(4) Hive Engine - Stake", () => {
  const mode: TransferMode = "stake";
  const asset: string = "";
  const assetBalance: number = 0.0;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = withStore(<Transfer {...props} />);
  const instance: any = (component.root.children[0] as ReactTestInstance).instance;

  it("(1) Step 1", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(2) Step 2", () => {
    instance.setState({ step: 2, to: "bar" });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(4) Step 4", () => {
    instance.setState({ step: 4 });
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("(5) Hive Engine - Unstake", () => {
  const mode: TransferMode = "unstake";
  const asset: string = "";
  const assetBalance: number = 0.0;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = withStore(<Transfer {...props} />);
  const instance: any = (component.root.children[0] as ReactTestInstance).instance;

  it("(1) Step 1", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(2) Step 2", () => {
    instance.setState({ step: 2, to: "bar" });
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(4) Step 4", () => {
    instance.setState({ step: 4 });
    expect(component.toJSON()).toMatchSnapshot();
  });
});
