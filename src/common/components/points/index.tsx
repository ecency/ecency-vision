import React, {Component} from "react";

import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";
import {Points} from "../../store/points/types"

import Tooltip from "../tooltip";

import {_t} from "../../i18n";

import {plusCircle, pencilOutlineSvg, commentSvg, chevronUpSvg, repeatSvg, starOutlineSvg, accountOutlineSvg, checkAllSvg, ticketSvg} from "../../img/svg";

interface Props {
    activeUser: ActiveUser | null;
    account: Account;
    points: Points;
}

interface State {
    claiming: boolean,
    purchasing: boolean
}

export class UserPoints extends Component<Props, State> {
    state: State = {
        claiming: false,
        purchasing: false
    }

    claim = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
    }

    togglePurchase = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

    }

    render() {

        const {claiming, purchasing} = this.state;
        const {activeUser, account, points} = this.props;

        const isMyPage = activeUser && activeUser.username === account.name;

        return (
            <div className="points-section">
                <div className="points">
                    <div className="point-name">eSteem Points</div>
                    <div className="points-val">
                        <div className="val">{points.points} POINTS</div>
                        {isMyPage && (
                            <span/>
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
            </div>
        );
    }
}

export default (p: Props) => {
    const props = {
        activeUser: p.activeUser,
        account: p.account,
        points: p.points
    }

    return <UserPoints {...props} />;
}

