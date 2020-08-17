import React, {Component} from "react";

import moment from "moment";

import {History} from "history";

import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";
import {Global} from "../../store/global/types";
import {Transactions} from "../../store/transactions/types";
import {Points, PointTransaction, TransactionType} from "../../store/points/types"

import DropDown from "../dropdown";
import Transfer from "../transfer";

import Tooltip from "../tooltip";

import {_t} from "../../i18n";

import {claimPoints} from "../../api/private";

import {
    accountOutlineSvg,
    checkAllSvg,
    chevronUpSvg,
    commentSvg,
    pencilOutlineSvg,
    plusCircle,
    repeatSvg,
    starOutlineSvg,
    ticketSvg,
    gpsSvg,
    compareHorizontalSvg,
    cashSvg
} from "../../img/svg";


export class TransactionRow extends Component<{ tr: PointTransaction }> {
    render() {
        const {tr} = this.props;

        let icon: JSX.Element | null = null;
        let lKey = '';
        const lArgs = {n: ''};

        switch (tr.type) {
            case TransactionType.CHECKIN:
                icon = starOutlineSvg;
                lKey = 'checkin';
                break;
            case TransactionType.LOGIN:
                icon = accountOutlineSvg;
                lKey = 'login';
                break;
            case TransactionType.CHECKIN_EXTRA:
                icon = checkAllSvg;
                lKey = 'checkin-extra';
                break;
            case TransactionType.POST:
                icon = pencilOutlineSvg;
                lKey = 'post';
                break;
            case TransactionType.COMMENT:
                icon = commentSvg;
                lKey = 'comment';
                break;
            case TransactionType.VOTE:
                icon = chevronUpSvg;
                lKey = 'vote';
                break;
            case TransactionType.REBLOG:
                icon = repeatSvg;
                lKey = 'reblog';
                break;
            case TransactionType.DELEGATION:
                icon = ticketSvg;
                lKey = 'delegation';
                break;
            case TransactionType.REFERRAL:
                icon = gpsSvg;
                lKey = 'referral';
                break;
            case TransactionType.TRANSFER_SENT:
                icon = compareHorizontalSvg;
                lKey = 'transfer-sent';
                lArgs.n = tr.receiver!;
                break;
            case TransactionType.TRANSFER_INCOMING:
                icon = compareHorizontalSvg;
                lKey = 'transfer-incoming';
                lArgs.n = tr.sender!;
                break;
            case TransactionType.MINTED:
                icon = cashSvg;
                break;
            default:
        }

        const date = moment(tr.created);
        const dateRelative = date.fromNow(true);

        return (
            <div className="transaction-list-item">
                <div className="transaction-icon">{icon}</div>
                <div className="transaction-title">
                    <div className="transaction-name">
                        {lKey && _t(`points.${lKey}-list-desc`, {...lArgs})}
                        {!lKey && <span>&nbsp;</span>}
                    </div>
                    <div className="transaction-date">
                        {dateRelative}
                    </div>
                </div>

                {tr.memo && (
                    <div className="transaction-details user-selectable">
                        {tr.memo}
                    </div>
                )}
                <div className="transaction-numbers">{tr.amount}</div>
            </div>
        );
    }
}

interface Props {
    global: Global;
    history: History;
    activeUser: ActiveUser | null;
    account: Account;
    points: Points;
    transactions: Transactions;
    addAccount: (data: Account) => void;
    updateActiveUser: (data: Account) => void;
}

interface State {
    claiming: boolean,
    purchase: boolean,
    transfer: boolean,
}

export class UserPoints extends Component<Props, State> {
    state: State = {
        claiming: false,
        purchase: false,
        transfer: false
    }

    claim = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        const {activeUser} = this.props;

        claimPoints(activeUser?.username!).then(r => {
            console.log(r);
        })
    }

    togglePurchase = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
    }

    toggleTransfer = () => {
        const {transfer} = this.state;
        this.setState({transfer: !transfer});
    }

    render() {
        const {claiming, transfer, purchase} = this.state;
        const {activeUser, account, points} = this.props;

        const isMyPage = activeUser && activeUser.username === account.name;

        const dropDownConfig = {
            history: this.props.history,
            label: '',
            items: [{
                label: _t('points.transfer'),
                onClick: this.toggleTransfer
            }]
        };

        return (
            <div className="points-section">
                <div className="points">
                    <div className="point-name">Ecency Points</div>
                    <div className="points-val">
                        <div className="val">{points.points} POINTS</div>
                        {isMyPage && (
                            <DropDown {...dropDownConfig} float="right"/>
                        )}
                    </div>
                    <div className="clearfix"/>

                    {(() => {
                        if (isMyPage) {
                            return (
                                <>
                                    <div className={`unclaimed ${isMyPage ? 'can-claim' : ''}`}>
                                        <div className="val">
                                            {points.uPoints !== '0.000' && (
                                                <div className="val">{points.uPoints}</div>
                                            )}
                                            {points.uPoints === '0.000' && (
                                                <div className="val">
                                                    {_t('points.get')}
                                                </div>
                                            )}
                                        </div>
                                        <a href="#" className={`claim-btn ${claiming ? 'in-progress' : ''}`}
                                           onClick={(e) => {
                                               if (points.uPoints !== '0.000') {
                                                   this.claim(e);
                                                   return;
                                               }
                                               this.togglePurchase(e);
                                           }}
                                        >
                                            {plusCircle}
                                        </a>
                                    </div>

                                    {points.uPoints !== '0.000' && (
                                        <>
                                            <div className="clearfix"/>
                                            <div className="get-estm">
                                                <a href="#" onClick={this.togglePurchase}>
                                                    {_t('points.get')}
                                                </a>
                                            </div>
                                        </>
                                    )}
                                </>
                            );
                        }

                        if (points.uPoints !== '0.000') {
                            return (
                                <div className="unclaimed">
                                    <div className="val">{points.uPoints}</div>
                                </div>
                            );
                        }

                        return null;
                    })()}
                </div>

                <div className="point-reward-types">
                    <Tooltip content={_t('points.post-desc')}>
                        <div className="point-reward-type">
                            {pencilOutlineSvg}
                            <span className="reward-num">15</span>
                        </div>
                    </Tooltip>
                    <Tooltip content={_t('points.comment-desc')}>
                        <div className="point-reward-type">
                            {commentSvg}
                            <span className="reward-num">5</span>
                        </div>
                    </Tooltip>
                    <Tooltip content={_t('points.vote-desc')}>
                        <div className="point-reward-type">
                            {chevronUpSvg}
                            <span className="reward-num">0.3</span>
                        </div>
                    </Tooltip>
                    <Tooltip content={_t('points.reblog-desc')}>
                        <div className="point-reward-type">
                            {repeatSvg}
                            <span className="reward-num">1</span>
                        </div>
                    </Tooltip>
                    <Tooltip content={_t('points.checkin-desc')}>
                        <div className="point-reward-type">
                            {starOutlineSvg}
                            <span className="reward-num">0.25</span>
                        </div>
                    </Tooltip>
                    <Tooltip content={_t('points.login-desc')}>
                        <div className="point-reward-type">
                            {accountOutlineSvg}
                            <span className="reward-num">99+</span>
                        </div>
                    </Tooltip>
                    <Tooltip content={_t('points.checkin-extra-desc')}>
                        <div className="point-reward-type">
                            {checkAllSvg}
                            <span className="reward-num">10</span>
                        </div>
                    </Tooltip>
                    <Tooltip content={_t('points.delegation-desc')}>
                        <div className="point-reward-type">
                            {ticketSvg}
                            <span className="reward-num">1</span>
                        </div>
                    </Tooltip>
                </div>

                {points.transactions.length > 0 && (
                    <div className="p-transaction-list">
                        <div className="transaction-list-header">
                            <h2>{_t('points.history')}</h2>
                        </div>
                        <div className="transaction-list-body">
                            {points.transactions.map(tr => <TransactionRow tr={tr} key={tr.id}/>)}
                        </div>
                    </div>
                )}

                {transfer && (<Transfer
                    {...this.props}
                    mode="transfer"
                    asset="POINT"
                    activeUser={this.props.activeUser!}
                    pointAmount={points.points}
                    onHide={this.toggleTransfer}/>)
                }
            </div>
        );
    }
}

export default (p: Props) => {
    const props = {
        global: p.global,
        history: p.history,
        activeUser: p.activeUser,
        account: p.account,
        points: p.points,
        transactions: p.transactions,
        addAccount: p.addAccount,
        updateActiveUser: p.updateActiveUser
    }

    return <UserPoints {...props} />;
}

