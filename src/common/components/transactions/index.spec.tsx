import React from "react";

import {createBrowserHistory} from "history";

import {TransactionRow} from "./index";
import TestRenderer from "react-test-renderer";
import {
    CurationReward,
    AuthorReward,
    CommentBenefactor,
    ClaimRewardBalance,
    Transfer,
    TransferToVesting,
    WithdrawVesting,
    FillOrder,
    ProducerReward,
    Interest,
    TransferToSavings,
    FillConvertRequest,
    CancelTransferFromSavings
} from "../../store/transactions/types";

import {dynamicPropsIntance1} from "../../helper/test-helper";

jest.mock("moment", () => () => ({
    fromNow: () => "2 hours ago",
}));

const defProps = {
    history: createBrowserHistory(),
    dynamicProps: dynamicPropsIntance1,
}

it("(1) curation_reward", () => {
    const transaction: CurationReward = {
        comment_author: "user2",
        comment_permlink: "hquwxmvg",
        curator: "user1",
        num: 3204172,
        reward: "33558.958220 VESTS",
        timestamp: "2020-06-06T09:25:12",
        type: "curation_reward",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) author_reward", () => {
    const transaction: AuthorReward = {
        author: "user1",
        num: 358711,
        permlink: "lorem-ipsum-dolor",
        hbd_payout: "4.174 HBD",
        hive_payout: "0.000 HIVE",
        timestamp: "2020-06-02T18:02:27",
        type: "author_reward",
        vesting_payout: "31749.102292 VESTS",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(3) comment_benefactor_reward", () => {
    const transaction: CommentBenefactor = {
        author: "xxxthorxxx",
        benefactor: "esteemapp",
        num: 2623508,
        permlink: "re-nonameslefttouse-2020530t135919321z",
        hbd_payout: "0.000 HBD",
        hive_payout: "0.000 HIVE",
        timestamp: "2020-06-06T10:59:24",
        type: "comment_benefactor_reward",
        vesting_payout: "3.893128 VESTS",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(4) claim_reward_balance", () => {
    const transaction: ClaimRewardBalance = {
        account: "user1",
        num: 359042,
        reward_hbd: "0.000 HBD",
        reward_hive: "0.000 HIVE",
        reward_vests: "806.030497 VESTS",
        timestamp: "2020-06-04T07:25:33",
        type: "claim_reward_balance",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(5) transfer", () => {
    const transaction: Transfer = {
        amount: "192.425 HIVE",
        from: "user1",
        memo: "lorem-ipsum-dolor",
        num: 3204231,
        timestamp: "2020-06-06T10:07:09",
        to: "user2",
        type: "transfer",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(6) transfer_to_vesting", () => {
    const transaction: TransferToVesting = {
        amount: "82.203 HIVE",
        from: "user1",
        num: 3204242,
        timestamp: "2020-06-06T10:14:33",
        to: "user2",
        type: "transfer_to_vesting",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(7) withdraw_vesting", () => {
    const transaction: WithdrawVesting = {
        num: 3204242,
        timestamp: "2020-06-06T10:14:33",
        acc: "user1",
        vesting_shares: "806.030497 VESTS",
        type: "withdraw_vesting",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(8) fill_order", () => {
    const transaction: FillOrder = {
        num: 3204242,
        timestamp: "2020-06-06T10:14:33",
        current_pays: "foo",
        open_pays: "bar",
        type: "fill_order",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(9) producer_reward", () => {
    const transaction: ProducerReward = {
        num: 4506230,
        timestamp: "2020-06-06T10:14:33",
        producer: "good-karma",
        vesting_shares: "466.396582 VESTS",
        type: "producer_reward"
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(10) interest", () => {
    const transaction: Interest = {
        num: 4506230,
        timestamp: "2021-03-11T13:04:57",
        owner: "foo",
        interest: "0.570 HBD",
        type: "interest",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(11) transfer_to_savings", () => {
    const transaction: TransferToSavings = {
        amount: "0.001 HIVE",
        from: "talhasch",
        memo: "test memo",
        num: 6621,
        timestamp: "2021-03-19T11:31:33",
        to: "talhasch",
        type: "transfer_to_savings",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(12) fill_convert_request", () => {
    const transaction: FillConvertRequest = {
        amount_in: "1.507 HBD",
        amount_out: "10.920 HIVE",
        num: 6264,
        timestamp: "2021-01-29T21:27:00",
        type: "fill_convert_request"
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});

it("(13) cancel_transfer_from_savings", () => {
    const transaction: CancelTransferFromSavings = {
        from: "foo",
        num: 22525,
        request_id: 1612448772,
        timestamp: "2021-02-06T09:00:51",
        type: "cancel_transfer_from_savings",
    };

    const props = {
        ...defProps,
        transaction,
    };

    const renderer = TestRenderer.create(<TransactionRow {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
});
