import React, {Component, Fragment} from "react";

import moment from "moment";

import {History} from "history";

import {FormControl} from "react-bootstrap";

import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";
import {Global} from "../../store/global/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Transactions} from "../../store/transactions/types";
import {Points, PointTransaction, TransactionType} from "../../store/points/types"

import BaseComponent from "../base";
import DropDown from "../dropdown";
import Transfer from "../transfer";
import Tooltip from "../tooltip";
import Purchase from "../purchase";
import Promote from "../promote";
import Boost from "../boost";

import LinearProgress from "../linear-progress";
import WalletMenu from "../wallet-menu";
import EntryLink from "../entry-link";

import {error, success} from "../feedback";

import {_t} from "../../i18n";

import {claimPoints} from "../../api/private-api";

import {
    accountGroupSvg,
    accountOutlineSvg,
    cashSvg,
    checkAllSvg,
    chevronUpSvg,
    commentSvg,
    compareHorizontalSvg,
    gpsSvg,
    pencilOutlineSvg,
    plusCircle,
    repeatSvg,
    starOutlineSvg,
    ticketSvg
} from "../../img/svg";


export const formatMemo = (memo: string, history: History) => {

    return memo.split(" ").map(x => {
        if (x.indexOf("/") >= 3) {
            const [author, permlink] = x.split("/");
            return <Fragment key={x}>{EntryLink({
                history: history,
                entry: {category: "ecency", author: author.replace("@", ""), permlink},
                children: <span>{"@"}{author.replace("@", "")}/{permlink}</span>
            })}{" "}</Fragment>
        }

        return <Fragment key={x}>{x}{" "}</Fragment>;
    });
}

interface TransactionRowProps {
    history: History;
    tr: PointTransaction;
}

export class TransactionRow extends Component<TransactionRowProps> {
    render() {
        const {tr, history} = this.props;

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
            case TransactionType.COMMUNITY:
                icon = accountGroupSvg;
                lKey = 'community';
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
                        {formatMemo(tr.memo, history)}
                    </div>
                )}
                <div className="transaction-numbers">{tr.amount}</div>
            </div>
        );
    }
}

interface Props {
    global: Global;
    dynamicProps: DynamicProps
    history: History;
    activeUser: ActiveUser | null;
    account: Account;
    points: Points;
    signingKey: string;
    transactions: Transactions;
    fetchPoints: (username: string, type?: number) => void;
    addAccount: (data: Account) => void;
    updateActiveUser: (data?: Account) => void;
    setSigningKey: (key: string) => void;
}

interface State {
    claiming: boolean;
    purchase: boolean;
    promote: boolean;
    boost: boolean;
    mounted: boolean;
    transfer: boolean;
}

export class WalletEcency extends BaseComponent<Props, State> {
    state: State = {
        claiming: false,
        purchase: false,
        promote: false,
        boost: false,
        mounted: false,
        transfer: false
    }

    componentDidMount() {
        const {global, history} = this.props;
        if (!global.usePrivate) {
            history.push("/");
        }
        let user = history.location.pathname.split("/")[1];
            user = user.replace('@','')
        global.isElectron && this.initiateOnElectron(user)
    }

    initiateOnElectron(username: string){
    const { fetchPoints, global } = this.props;
    const {mounted} = this.state;
    if(!mounted && global.isElectron){
        let getPoints = new Promise(res=>fetchPoints(username))
        username && getPoints.then(res=>this.stateSet({mounted: true}));
    }
}

    claim = (e?: React.MouseEvent<HTMLAnchorElement>) => {
        if (e) e.preventDefault();
        const {activeUser, fetchPoints, updateActiveUser, global} = this.props;
        this.stateSet({claiming: true});
        const username = activeUser?.username!;
            claimPoints(username).then(() => {
            success(_t('points.claim-ok'));
            fetchPoints(username);
            updateActiveUser();
        }).catch(() => {
            error(_t('g.server-error'));
        }).finally(() => {
            this.setState({claiming: false});
        });
    }

    togglePurchase = (e?: React.MouseEvent<HTMLAnchorElement>) => {
        if (e) e.preventDefault();

        const {purchase} = this.state;
        this.setState({purchase: !purchase});
    }

    togglePromote = () => {
        const {promote} = this.state;
        this.setState({promote: !promote});
    }

    toggleTransfer = () => {
        const {transfer} = this.state;
        this.setState({transfer: !transfer});
    }

    toggleBoost = () => {
        const {boost} = this.state;
        this.setState({boost: !boost});
    }

    filterChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        const filter = Number(e.target.value);
        const {fetchPoints, account} = this.props;
        fetchPoints(account.name, filter);
    }

    render() {
        const {claiming, transfer, purchase, promote, boost} = this.state;
        const {global, activeUser, account, points} = this.props;

        if (!global.usePrivate) {
            return null;
        }

        const isMyPage = activeUser && activeUser.username === account.name;

        const dropDownConfig = {
            history: this.props.history,
            label: '',
            items: [{
                label: _t('points.transfer'),
                onClick: this.toggleTransfer
            }, {
                label: _t('points.promote'),
                onClick: this.togglePromote
            }, {
                label: _t('points.boost'),
                onClick: this.toggleBoost
            }]
        };

        const txFilters = [
            TransactionType.CHECKIN, TransactionType.LOGIN, TransactionType.CHECKIN_EXTRA,
            TransactionType.POST, TransactionType.COMMENT, TransactionType.VOTE,
            TransactionType.REBLOG, TransactionType.DELEGATION, TransactionType.REFERRAL,
            TransactionType.COMMUNITY, TransactionType.TRANSFER_SENT, TransactionType.TRANSFER_INCOMING];

        return (
            <>
                <div className="wallet-ecency">
                    <div className="wallet-main">
                        <div className="wallet-info">
                            {points.uPoints !== '0.000' && (
                                <div className="unclaimed-rewards">
                                    <div className="title">
                                        {_t('points.unclaimed-points')}
                                    </div>
                                    <div className="rewards">
                                        <span className="reward-type">{`${points.uPoints}`}</span>
                                        {isMyPage && (
                                            <Tooltip content={_t('points.claim-reward-points')}>
                                                <a
                                                    className={`claim-btn ${claiming ? 'in-progress' : ''}`}
                                                    onClick={this.claim}>
                                                    {plusCircle}
                                                </a>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="balance-row alternative">
                                <div className="balance-info">
                                    <div className="title">{"Ecency Points"}</div>
                                    <div className="description">{_t("points.main-description")}</div>
                                </div>
                                <div className="balance-values">
                                    <div className="amount">
                                        {isMyPage && (
                                            <div className="amount-actions">
                                                <DropDown {...dropDownConfig} float="right"/>
                                            </div>
                                        )}

                                        <>{points.points} {"POINTS"}</>
                                    </div>
                                </div>
                            </div>

                            <div className="get-points">
                                <div className="points-types">
                                    <div className="points-types-title">{_t("points.earn-points")}</div>
                                    <div className="points-types-list">
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
                                                <span className="reward-num">10</span>
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
                                                <span className="reward-num">10</span>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content={_t('points.community-desc')}>
                                            <div className="point-reward-type">
                                                {accountGroupSvg}
                                                <span className="reward-num">20</span>
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                                {isMyPage && (
                                    <div className="buy-points">
                                        <a href="#" onClick={this.togglePurchase}> {_t('points.get')}</a>
                                    </div>
                                )}
                            </div>

                            <div className="p-transaction-list">
                                <div className="transaction-list-header">
                                    <h2>{_t('points.history')}</h2>
                                    <FormControl as="select" value={points.filter} onChange={this.filterChanged}>
                                        <option value="0">{_t("points.filter-all")}</option>
                                        {txFilters.map(x => <option key={x} value={x}>{_t(`points.filter-${x}`)}</option>)}
                                    </FormControl>
                                </div>

                                {(() => {
                                    if (points.loading) {
                                        return <LinearProgress/>
                                    }

                                    return <div className="transaction-list-body">
                                        {points.transactions.map(tr => <TransactionRow history={this.props.history} tr={tr} key={tr.id}/>)}
                                        {(!points.loading && points.transactions.length === 0) && <p className="text-muted empty-list">{_t('g.empty-list')}</p>}
                                    </div>
                                })()}
                            </div>
                        </div>

                        <WalletMenu global={global} username={account.name} active="ecency"/>
                    </div>

                    {transfer && (<Transfer
                        {...this.props}
                        mode="transfer"
                        asset="POINT"
                        activeUser={this.props.activeUser!}
                        onHide={this.toggleTransfer}/>)
                    }

                    {purchase && (<Purchase {...this.props} activeUser={this.props.activeUser!} onHide={this.togglePurchase}/>)}
                    {promote && (<Promote {...this.props} activeUser={this.props.activeUser!} onHide={this.togglePromote}/>)}
                    {boost && (<Boost {...this.props} activeUser={this.props.activeUser!} onHide={this.toggleBoost}/>)}
                </div>
            </>
        );
    }
}

export default (p: Props) => {
    const props = {
        global: p.global,
        dynamicProps: p.dynamicProps,
        history: p.history,
        activeUser: p.activeUser,
        account: p.account,
        points: p.points,
        signingKey: p.signingKey,
        transactions: p.transactions,
        fetchPoints: p.fetchPoints,
        addAccount: p.addAccount,
        updateActiveUser: p.updateActiveUser,
        setSigningKey: p.setSigningKey
    }

    return <WalletEcency {...props} />;
}

