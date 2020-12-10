import React from "react";

import {Transfer, TransferAsset, TransferMode} from "./index";

import {globalInstance, dynamicPropsIntance1} from "../../helper/test-helper";

import TestRenderer from "react-test-renderer";

const defProps = {
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    users: [],
    activeUser: {
        username: 'foo',
        data: {
            name: 'foo',
            balance: '12.234 HIVE',
            sbd_balance: '4321.212',
            savings_balance: '2123.000 HIVE'
        },
        points: {
            points: "10.000",
            uPoints: "0.000"
        }
    },
    transactions: {
        list: [],
        loading: false,
        error: false
    },
    signingKey: '',
    addAccount: () => {
    },
    updateActiveUser: () => {
    },
    setSigningKey: () => {

    },
    onHide: () => {
    }
};

describe('(1) Transfer HIVE', () => {
    const mode: TransferMode = 'transfer';
    const asset: TransferAsset = 'HIVE';

    const props = {
        mode,
        asset,
        ...defProps
    };

    const component = TestRenderer.create(<Transfer {...props} />);
    const instance: any = component.getInstance();

    it("(1) Step 1", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(2) Step 2", () => {
        instance.setState({step: 2, to: 'bar'});
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(3) Step 3", () => {
        instance.setState({step: 3});
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(4) Step 4", () => {
        instance.setState({step: 4});
        expect(component.toJSON()).toMatchSnapshot();
    });
});

describe('(2) Transfer HBD', () => {
    const mode: TransferMode = 'transfer';
    const asset: TransferAsset = 'HBD';

    const props = {
        mode,
        asset,
        ...defProps
    };

    const component = TestRenderer.create(<Transfer {...props} />);
    const instance: any = component.getInstance();

    it("(1) Step 1", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(2) Step 2", () => {
        instance.setState({step: 2, to: 'bar', memo: 'hdb transfer'});
        expect(component.toJSON()).toMatchSnapshot();
    });

    // No need to test step3 anymore

    it("(4) Step 4", () => {
        instance.setState({step: 4});
        expect(component.toJSON()).toMatchSnapshot();
    });
});

describe('(3) Transfer POINT', () => {
    const mode: TransferMode = 'transfer';
    const asset: TransferAsset = 'POINT';

    const props = {
        mode,
        asset,
        ...defProps
    };

    const component = TestRenderer.create(<Transfer {...props} />);
    const instance: any = component.getInstance();

    it("(1) Step 1", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(2) Step 2", () => {
        instance.setState({step: 2, to: 'bar'});
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(4) Step 4", () => {
        instance.setState({step: 4});
        expect(component.toJSON()).toMatchSnapshot();
    });
});

describe('(4) Transfer to Savings - HBD', () => {
    const mode: TransferMode = 'transfer-saving';
    const asset: TransferAsset = 'HBD';

    const props = {
        mode,
        asset,
        ...defProps
    };

    const component = TestRenderer.create(<Transfer {...props} />);
    const instance: any = component.getInstance();

    it("(1) Step 1", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(2) Step 2", () => {
        instance.setState({step: 2, to: 'bar'});
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(4) Step 4", () => {
        instance.setState({step: 4});
        expect(component.toJSON()).toMatchSnapshot();
    });
});

describe('(5) Withdraw Savings - HIVE', () => {
    const mode: TransferMode = 'withdraw-saving';
    const asset: TransferAsset = 'HIVE';

    const props = {
        mode,
        asset,
        ...defProps
    };

    const component = TestRenderer.create(<Transfer {...props} />);
    const instance: any = component.getInstance();

    it("(1) Step 1", () => {
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(2) Step 2", () => {
        instance.setState({step: 2, to: 'bar'});
        expect(component.toJSON()).toMatchSnapshot();
    });

    it("(4) Step 4", () => {
        instance.setState({step: 4});
        expect(component.toJSON()).toMatchSnapshot();
    });
});
