import React from "react";

import { Transfer, TransferAsset, TransferMode } from "./index";

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
  tokens: [],
  assetBalance: 0
};

describe("(1) Transfer HIVE", () => {
  const mode: TransferMode = "transfer";
  const asset: TransferAsset = "HIVE";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(2) Transfer HBD", () => {
  const mode: TransferMode = "transfer";
  const asset: TransferAsset = "HBD";

  const props = {
    ...defProps,
    mode,
    asset
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();

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

describe("(3) Transfer Proof of Brain", () => {
  const mode: TransferMode = "transfer";
  const asset: TransferAsset = "POB";
  const tokens = [
    new HiveEngineToken({
      symbol: "POB",
      name: "Proof of Brain",
      icon: "https://i.postimg.cc/02vXm7Rb/poblogo.png",
      precision: 8,
      stakingEnabled: true,
      delegationEnabled: true,
      balance: "485.9438739",
      stake: "94782.30057459",
      delegationsIn: "0",
      delegationsOut: "4.00000001"
    })
  ];

  const props = {
    ...defProps,
    mode,
    asset,
    tokens
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

describe("(4) Transfer to Savings - HBD", () => {
  const mode: TransferMode = "transfer-saving";
  const asset: TransferAsset = "HBD";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(5) Withdraw Savings - HIVE", () => {
  const mode: TransferMode = "withdraw-saving";
  const asset: TransferAsset = "HIVE";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(6) Convert", () => {
  const mode: TransferMode = "convert";
  const asset: TransferAsset = "HBD";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(7) Power up", () => {
  const mode: TransferMode = "power-up";
  const asset: TransferAsset = "HIVE";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(7) Power up FOODIE", () => {
  const mode: TransferMode = "power-up";
  const asset: TransferAsset = "HIVE";
  const tokens: HiveEngineToken[] = [
    new HiveEngineToken({
      symbol: "FOODIE",
      name: "Foodies Bee Hive",
      icon: "https://files.peakd.com/file/peakd-hive/hive-120586/MEe37llw-FBH_plate_icon-noUtil.png",
      precision: 5,
      stakingEnabled: true,
      delegationEnabled: true,
      balance: "0",
      stake: "0.134",
      delegationsIn: "0",
      delegationsOut: "0"
    })
  ];

  const props = {
    ...defProps,
    mode,
    asset,
    tokens
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

describe("(8) Delegate", () => {
  const mode: TransferMode = "delegate";
  const asset: TransferAsset = "HP";

  const props = {
    ...defProps,
    mode,
    asset
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

describe("(9) Power down", () => {
  const mode: TransferMode = "power-down";
  const asset: TransferAsset = "HP";

  const props = {
    ...defProps,
    mode,
    asset
  };

  const component = TestRenderer.create(<Transfer {...props} />);
  const instance: any = component.getInstance();
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

  const component = TestRenderer.create(<Transfer {...props} />);

  it("(1) Step 1", () => {
    expect(component.toJSON()).toMatchSnapshot();
  });
});

// const tokens  = [
// {
// "symbol": "FQX",
// "name": "Fucks",
// "icon": "https://files.steempeak.com/file/steempeak/madmagazine/ugnZJiIL-phuqxray2.gif",
// "precision": 8,
// "stakingEnabled": false,
// "delegationEnabled": false,
// "balance": "1090.62697017",
// "stake": "0",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0"
// },
// {
// "symbol": "POB",
// "name": "Proof of Brain",
// "icon": "https://i.postimg.cc/02vXm7Rb/poblogo.png",
// "precision": 8,
// "stakingEnabled": true,
// "delegationEnabled": true,
// "balance": "485.9438739",
// "stake": "94782.30057459",
// "delegationsIn": "0",
// "delegationsOut": "4.00000001",
// "stakedBalance": "94778.30057458"
// },
// {
// "symbol": "ENGAGE",
// "name": "Engagement Token",
// "icon": "https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/abh12345/H6EINbDA-1.png",
// "precision": 3,
// "stakingEnabled": false,
// "delegationEnabled": false,
// "balance": "115",
// "stake": "0",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0"
// },
// {
// "symbol": "CCC",
// "name": "Creative Coin",
// "icon": "https://steemitimages.com/640x0/https://cdn.steemitimages.com/DQmfJtyqNLx8gU6UD1hcHjmCv4kYAyxS5ZogzpFecNBGtCS/CCdiscordLogo.png",
// "precision": 5,
// "stakingEnabled": true,
// "delegationEnabled": true,
// "balance": "15.75905",
// "stake": "15.75905",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "15.75905"
// },
// {
// "symbol": "BPC",
// "name": "bilpcoin",
// "icon": "https://i.imgur.com/L9dv7Vz.png[/img]",
// "precision": 6,
// "stakingEnabled": true,
// "delegationEnabled": false,
// "balance": "13.692491",
// "stake": "13.692491",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "13.692491"
// },
// {
// {
// "symbol": "CTP",
// "name": "CTP Token",
// "icon": "https://clicktrackprofit.com/v2/images/ctp_icon.png",
// "precision": 3,
// "stakingEnabled": true,
// "delegationEnabled": true,
// "balance": "12.777",
// "stake": "0",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0"
// },
// {
// "symbol": "LOLZ",
// "name": "LOLz Token",
// "icon": "https://lolztoken.com/wp-content/uploads/2022/02/emoji-happy.gif",
// "precision": 8,
// "stakingEnabled": true,
// "delegationEnabled": false,
// "balance": "8",
// "stake": "0",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0"
// },
// {
// "symbol": "LEO",
// "name": "Leo",
// "icon": "https://media.giphy.com/media/eLXRoZZkWMAyqEpic0/giphy.gif",
// "precision": 3,
// "stakingEnabled": true,
// "delegationEnabled": true,
// "balance": "3.558",
// "stake": "0",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0"
// },
// {
// "symbol": "BST",
// "name": "BULLSHIT Token",
// "icon": "https://images.hive.blog/DQmdAYfg3L9PpWwReweDWoWoyarnj8J3idxsLRurUMH5nAU/Element%206normal.png",
// "precision": 0,
// "stakingEnabled": false,
// "delegationEnabled": false,
// "balance": "3",
// "stake": "0",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0"
// },
// {
// "symbol": "PIZZA",
// "name": "PIZZA",
// "icon": "https://i.imgur.com/TE19kib.png",
// "precision": 2,
// "stakingEnabled": true,
// "delegationEnabled": false,
// "balance": "2",
// "stake": "0.8",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0.8"
// },
// {
// "symbol": "LIST",
// "name": "Hivelist Token",
// "icon": "https://i.postimg.cc/3Jccv5Yb/hivelist-token-gear-new.png",
// "precision": 8,
// "stakingEnabled": true,
// "delegationEnabled": true,
// "balance": "0.98387449",
// "stake": "0.98387449",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0.98387449"
// },
// {
// "symbol": "LERN",
// "name": "LERN Token",
// "icon": "https://img1.wsimg.com/isteam/ip/ce73b62b-4324-43ab-ab62-739e704b8e20/logo/59c9b77d-a32e-422f-880c-44d33a833d0a.jpg/:/rs=h:160,cg:true,m/qt=q:95",
// "precision": 8,
// "stakingEnabled": true,
// "delegationEnabled": true,
// "balance": "0.96811612",
// "stake": "0.96811612",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0.96811612"
// },
// {
// "symbol": "GAMER",
// "name": "Krypto Gamers Token",
// "icon": "https://cdn.steemitimages.com/DQmc39SLQfnkzC9SE8uZXjV3optpu2GwzX1g7d7igSNW8Dn/logo1.png",
// "precision": 4,
// "stakingEnabled": true,
// "delegationEnabled": false,
// "balance": "0.625",
// "stake": "0",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0"
// },
// {
// "symbol": "FOODIE",
// "name": "Foodies Bee Hive",
// "icon": "https://files.peakd.com/file/peakd-hive/hive-120586/MEe37llw-FBH_plate_icon-noUtil.png",
// "precision": 5,
// "stakingEnabled": true,
// "delegationEnabled": true,
// "balance": "0",
// "stake": "0.134",
// "delegationsIn": "0",
// "delegationsOut": "0",
// "stakedBalance": "0.134"
// }
// ];
