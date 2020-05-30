import React, { Component } from 'react';

import { Modal, Table, Pagination, Button } from 'react-bootstrap';

import { Entry } from '../../store/entries/types';

import { getPost } from '../../api/hive';

import parseAsset from '../../helper/parse-asset';

import FormattedCurrency from '../formatted-currency';

import {chevronLeftSvg, chevronRightSvg} from '../../../svg';

interface Vote {
    voter: string,
    rshares: string,
    reward?: number
}

export const prepareVotes = (entry: Entry, votes: Vote[]): Vote[] => {
    const totalPayout =
        parseAsset(entry.pending_payout_value).value +
        parseAsset(entry.author_payout_value).value +
        parseAsset(entry.curator_payout_value).value;

    const voteRshares = votes.reduce(
        (a, b) => a + parseFloat(b.rshares),
        0
    );
    const ratio = totalPayout / voteRshares;

    return votes.map(a => {
        const rew = parseFloat(a.rshares) * ratio;

        return Object.assign({}, a, {
            reward: rew,
        });
    }).sort((a, b) => {
        const keyA = a.reward;
        const keyB = b.reward;

        if (keyA > keyB) return -1;
        if (keyA < keyB) return 1;
        return 0;
    });
};


export class EntryVotersDetail extends Component<{ votes: Vote[] }, { page: number }>{
    state = {
        page: 0
    }

    prev = () => {
        const { page } = this.state;
        this.setState({ page: page - 1 });
    }

    next = () => {
        const { page } = this.state;
        this.setState({ page: page + 1 });
    }

    render() {
        const { votes } = this.props;
        const { page } = this.state;

        const pageSize = 10;
        const totalPages = Math.ceil(votes.length / pageSize);

        const start = page * pageSize;

        const hasPrev = page !== 0;
        const hasNext = page + 1 !== totalPages;

        const votes_ = votes.slice(start, start + pageSize)

        return (
            <>
                <Table borderless={true} striped={true}>
                    <tbody>
                        {votes_.map((v, i) => (<tr key={i}>
                            <td>{v.voter}</td>
                            <td><FormattedCurrency {...this.props} value={v.reward} /></td>
                        </tr>))}
                    </tbody>
                </Table>
                
                <div className="voters-pagination">
                        <Button size="sm" disabled={!hasPrev} onClick={this.prev}>{chevronLeftSvg}</Button>
                    <div className="page-numbers">
                        <span className="current-page"> {page + 1}</span> / {totalPages}
                    </div>
                    <Button size="sm" disabled={!hasNext} onClick={this.next}>{chevronRightSvg}</Button>
                </div>
            </>
        )
    }
}

interface Props {
    entry: Entry,
    children: JSX.Element
}


export default class EntryVoters extends Component<Props, { visible: boolean, votes: Vote[] }> {

    state = {
        visible: false,
        votes: []
    }

    show = () => {
        const { entry } = this.props;
        getPost(entry.author, entry.permlink).then(r => {
            this.setState({ visible: true, votes: prepareVotes(entry, r.active_votes) });
        });
    };

    hide = () => {
        this.setState({ visible: false, votes: [] });
    };

    render() {
        const { children } = this.props;
        const { visible, votes } = this.state;

        const clonedChildren = React.cloneElement(children, {
            onClick: this.show
        });

        return <>
            {clonedChildren}
            {visible && (
                <Modal onHide={this.hide} show={true} centered={true}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>Voters {votes.length}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <EntryVotersDetail {...this.props} votes={votes} />
                    </Modal.Body>
                </Modal>
            )}
        </>;
    }
}
