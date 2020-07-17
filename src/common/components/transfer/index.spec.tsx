import React from "react";

import {TransferDialog, TransferAsset, TransferMode} from "./index";

import TestRenderer from "react-test-renderer";

const defProps = {
    users: [],
    activeUser: {
        username: 'foo',
        data: {
            name: 'foo',
            balance: '12.234 HIVE'
        }
    },
    transactions: {
        list: [],
        loading: false,
        error: false
    },
    addAccount: () => {

    },
    updateActiveUser: () => {

    },
    onHide: () => {

    }
};

describe('(1) Transfer', () => {

    const mode: TransferMode = 'transfer';
    const asset: TransferAsset = 'HIVE';

    const props = {
        mode,
        asset,
        ...defProps
    };

    const component = TestRenderer.create(<TransferDialog {...props} />);
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
})

