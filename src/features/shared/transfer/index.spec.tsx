import React from "react";

import { Transfer, TransferAsset, TransferMode } from "./index";

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
    username: "bar",
    data: {
      ...fullAccountInstance,
      name: "bar"
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

describe("(1) Transfer HIVE", () => {
  const mode: TransferMode = "transfer";
  const asset: TransferAsset = "HIVE";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(2) Transfer HBD", () => {
  const mode: TransferMode = "transfer";
  const asset: TransferAsset = "HBD";

  const props = {
    ...defProps,
    mode,
    asset
  };

  const component = withStore(<Transfer {...props} />);
  const instance: any = (component.root.children[0] as ReactTestInstance).instance;

  it("(1) Step 1", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("(2) Step 2", () => {
    instance.setState({ step: 2, to: "bar", memo: "hdb transfer" });
    expect(component.toJSON()).toMatchSnapshot();
  });

  // No need to test step3 anymore

  it("(4) Step 4", () => {
    instance.setState({ step: 4 });
    expect(component.toJSON()).toMatchSnapshot();
  });
});

describe("(3) Transfer POINT", () => {
  const mode: TransferMode = "transfer";
  const asset: TransferAsset = "POINT";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(4) Transfer to Savings - HBD", () => {
  const mode: TransferMode = "transfer-saving";
  const asset: TransferAsset = "HBD";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(5) Withdraw Savings - HIVE", () => {
  const mode: TransferMode = "withdraw-saving";
  const asset: TransferAsset = "HIVE";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(6) Convert", () => {
  const mode: TransferMode = "convert";
  const asset: TransferAsset = "HBD";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(7) Power up", () => {
  const mode: TransferMode = "power-up";
  const asset: TransferAsset = "HIVE";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(8) Delegate", () => {
  const mode: TransferMode = "delegate";
  const asset: TransferAsset = "HP";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(9) Power down", () => {
  const mode: TransferMode = "power-down";
  const asset: TransferAsset = "HP";

  const props = {
    ...defProps,
    mode,
    asset
  };

  const component = withStore(<Transfer {...props} />);
  const instance: any = (component.root.children[0] as ReactTestInstance).instance;
  instance.setState({ amount: "2.000" });

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

describe("(10) Powering down", () => {
  const mode: TransferMode = "power-down";
  const asset: TransferAsset = "HP";

  const props = {
    ...defProps,
    mode,
    asset,
    activeUser: {
      username: "foo",
      data: {
        ...fullAccountInstance,
        next_vesting_withdrawal: "2020-12-21T09:34:54",
        vesting_withdraw_rate: "525426.335537 VESTS",
        to_withdraw: "6830542361972",
        withdrawn: "6305116026444",
        name: "foo"
      },
      points: {
        points: "10.000",
        uPoints: "0.000"
      }
    }
  };

  const component = withStore(<Transfer {...props} />);

  it("(1) Step 1", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });
});
