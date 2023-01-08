import React from "react";

import { Transfer, TransferMode } from "./index";

import { initialState as transactionsInitialState } from "../../store/transactions/index";

import {
  globalInstance,
  dynamicPropsIntance1,
  fullAccountInstance
} from "../../helper/test-helper";

import TestRenderer from "react-test-renderer";
import HiveEngineToken from "../../helper/hive-engine-wallet";

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
  _to: "",
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
  fetchPoints: () => {},
  updateWalletValues: () => {},
  onHide: () => {},
  tokens: [
    new HiveEngineToken({
      symbol: "POB",
      name: "Proof of Brain",
      precision: 8,
      stakingEnabled: true,
      delegationEnabled: true,
      balance: "5000 POB",
      stake: "6000 POB",
      icon: "",
      delegationsIn: "0 POB",
      delegationsOut: "0 POB"
    })
  ],
  delegationList: []
};

describe("(12) Hive Engine - Transfer 15 POB", () => {
  const mode: TransferMode = "transfer";
  const asset: string = "POB";
  const assetBalance: number = 5000;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance,
    amount: "15"
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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

describe("(14) Hive Engine - Transfer 6 mPOB", () => {
  const mode: TransferMode = "transfer";
  const asset: string = "POB";
  const assetBalance: number = 5000;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance,
    amount: "0.006"
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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

describe("(15) Hive Engine - Transfer 3 µPOB", () => {
  const mode: TransferMode = "transfer";
  const asset: string = "POB";
  const assetBalance: number = 5000;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance,
    amount: "0.000003"
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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

describe("(16) Hive Engine - Transfer 0.07 µPOB", () => {
  const mode: TransferMode = "transfer";
  const asset: string = "POB";
  const assetBalance: number = 5000;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance,
    amount: "0.00000007"
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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

describe("(17) Hive Engine - Transfer 0.01 µPOB", () => {
  const mode: TransferMode = "transfer";
  const asset: string = "POB";
  const assetBalance: number = 5000;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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
  const asset: string = "WEED";
  const assetBalance: number = 0.0;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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
  const asset: string = "LOLZ";
  const assetBalance: number = 4.0;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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
  const asset: string = "BST";
  const assetBalance: number = 20;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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
  const asset: string = "POB";
  const assetBalance: number = 10000;

  const props = {
    ...defProps,
    mode,
    asset,
    assetBalance
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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
