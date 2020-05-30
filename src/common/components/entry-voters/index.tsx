import React, { Component } from 'react';

import { Modal } from 'react-bootstrap';

import { Entry } from '../../store/entries/types';

import { getPost } from '../../api/hive';

import parseAsset from '../../helper/parse-asset';

import parseDate from '../../helper/parse-date';




interface Vote {
    voter: string,
    rshares: string,
    reward?: number
}

interface Props {
    entry: Entry,
    children: JSX.Element
}

interface State {
    visible: boolean,
    votes: Vote[]
}

export const prepareVotes = (entry: Entry, votes: Vote[]) => {
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
    })
        .sort((a, b) => {
            const keyA = a.reward;
            const keyB = b.reward;

            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
            return 0;
        });
};


export default class EntryVoters extends Component<Props, State> {
    state: State = {
        visible: false,
        votes: []
    }

    componentDidMount() {
        console.log("mount")
    }

    show = () => {
        this.setState({ visible: true });

        const { entry } = this.props;
        getPost(entry.author, entry.permlink).then(r => {

            this.setState({ votes: r.active_votes });

            console.log(r);
        })
    };

    hide = () => {
        this.setState({ visible: false });
        this.setState({ votes: [] });
    };

    render() {
        const { entry, children } = this.props;
        const { visible, votes } = this.state;

        const clonedChildren = React.cloneElement(children, {
            onClick: this.show
        });

        return <>
            {clonedChildren}
            {visible && (
                <Modal onHide={this.hide} size="sm" show={true} centered={true}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Voters {votes.length}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Henlo
                    </Modal.Body>
                </Modal>
            )}
        </>;
    }
}
