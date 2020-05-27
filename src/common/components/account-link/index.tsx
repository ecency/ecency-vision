import React, {Component} from 'react';
import {History} from 'history';
import {ExtendedAccount} from '@esteemapp/dhive';

import {getAccount} from '../../api/hive';

export const makePath = (username: string) => `/@${username}`;

interface Props {
    history: History,
    children: JSX.Element,
    username: string,
    account: ExtendedAccount | null,
    onClick: (e: React.MouseEvent<HTMLElement>) => void,
    afterClick: (e: React.MouseEvent<HTMLElement>) => void
}

export default class AccountLink extends Component<Props> {
    public static defaultProps = {
        account: null,
        onClick: () => {
        },
        afterClick: () => {

        }
    };

    goProfile = async (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();

        const {username, history, onClick, afterClick} = this.props;

        onClick(e);

        let {account} = this.props;

        if (!account) {
            try {
                account = await getAccount(username);
            } catch (err) {
                account = null;
            }
        }

        if (account) {
            // TODO: set user reducer here
            //  setVisitingAccount(account);
        }

        history.push(makePath(username));

        afterClick(e);
    };

    render() {
        const {children, username} = this.props;
        const href = makePath(username);

        const props = Object.assign({}, children.props, {href, onClick: this.goProfile});

        return React.createElement('a', props);
    }
}
