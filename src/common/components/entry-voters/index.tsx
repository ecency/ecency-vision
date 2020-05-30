import React, { Component } from 'react';

import { Modal } from 'react-bootstrap';

import { Entry } from '../../store/entries/types';

import {getPost} from '../../api/hive';

/*

export const prepareVotes = entry => {
    const totalPayout =
      parseToken(entry.pending_payout_value) +
      parseToken(entry.total_payout_value) +
      parseToken(entry.curator_payout_value);
  
    const voteRshares = entry.active_votes.reduce(
      (a, b) => a + parseFloat(b.rshares),
      0
    );
    const ratio = totalPayout / voteRshares;
  
    return entry.active_votes
      .map(a => {
        const rew = a.rshares * ratio;
  
        return Object.assign({}, a, {
          reputation: authorReputation(a.reputation),
          reward: rew,
          time: parseDate(a.time),
          percent: a.percent / 100
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

*/

interface Vote {
    voter: string,
    rshares: string
}

interface Props {
    entry: Entry,
    children: JSX.Element
}

interface State {
    visible: boolean,
    votes: Vote[]
}

export default class EntryVoters extends Component<Props, State> {
    state: State = {
        visible: false,
        votes: []
    }

    componentDidMount(){
        console.log("mount")
    }

    show = () => {
        this.setState({ visible: true });

        const {entry} = this.props;
        getPost(entry.author, entry.permlink).then(r => {
            console.log(r)
            this.setState({votes: r.active_votes});
        })
    };

    hide = () => {
        this.setState({ visible: false });
        this.setState({votes: []});
    };

    render() {
        const { entry, children } = this.props;
        const { visible, votes } = this.state;

        const clonedChildren = React.cloneElement(children, {
            onClick: this.show
        });

        console.log(votes)

        return <>
            {clonedChildren}
            {visible && (
                <Modal onHide={this.hide} show={true} centered>
                    <Modal.Body>
                        Henlo
                    </Modal.Body>
                </Modal>
            )}
        </>;
    }
}
