import React, {Component, Fragment, useEffect, useState} from "react";

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

import {claimPoints, getCurrencyTokenRate} from "../../api/private-api";
import { claimBaPoints} from "../../api/breakaway";

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
import FormattedCurrency from "../formatted-currency";

import axios, { AxiosResponse } from 'axios';
import { Button } from "react-bootstrap"
import { getAccount } from "../../api/hive"
import { getBaUserPoints } from "../../api/breakaway";


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
                        {/* {tr.operationType} */}
                        {/* {lKey && _t(`points.${lKey}-list-desc`, {...lArgs})} */}Point
                        {/* {!lKey && <span>&nbsp;</span>} */}300
                    </div>
                    <div className="transaction-date">
                        {dateRelative}30000
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
    updateWalletValues: () => void;
    addAccount: (data: Account) => void;
    updateActiveUser: (data?: Account) => void;
    setSigningKey: (key: string) => void;
}

interface State {
    claiming: boolean;
    purchase: boolean;
    promote: boolean;
    boost: boolean;
    transfer: boolean;
    estimatedPointsValue: number;
    estimatedPointsValueLoading: boolean;
}
export const WalletEcency = (props: Props) => {

    const [purchase, setPurchase] = useState(false);
    const [promote, setPromote] = useState(false);
    const [boost, setBoost] = useState(false);
    const [transfer, setTransfer] = useState(false);
    const [estimatedPointsValue, setEstimatedPointsValue] = useState(0);
    const [estimatedPointsValueLoading, setEstimatedPointsValueLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    
    const [pointsHistory, setPointsHistory] = useState<any>([]);
    const [claiming, setClaiming] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [userPoints, setUserPoints] = useState<any>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const [communityInfo, setCommunityInfo] = useState<any>()

    const {global, activeUser, account, points, history, fetchPoints, updateActiveUser} = props;

    useEffect(() => {
        setIsMounted(true);
        let user = history.location.pathname.split("/")[1];
        user = user.replace('@','')
        global.isElectron && initiateOnElectron(user);
        getEstimatedPointsValue();
        getCommunity(); 
      
        if (communityInfo?.profile && isMounted ) {
            // console.log(communityInfo)
          getPointsHistory(user, communityInfo?.profile?.name);
          getUserPoints();
        }
      
        return () => {
          setIsMounted(false);
        }
      }, [claimed, communityInfo?.profile?.name]);      

    const getEstimatedPointsValue = () => {
        const {global: {currency}} = props;
        setEstimatedPointsValueLoading(true);
        getCurrencyTokenRate(currency,'estm').then(res => {
            setEstimatedPointsValue(res);
            setEstimatedPointsValueLoading(false);
        }).catch((error) => {
            setEstimatedPointsValueLoading(false);
            setEstimatedPointsValue(0);
        });
    }

    const initiateOnElectron = (username: string) => {
        if(!isMounted && global.isElectron){
            let getPoints = new Promise(res=>fetchPoints(username))
            username && getPoints.then(res=>{
                setIsMounted(true)
            }).catch((error) => {
                console.error('getPoints',error);
            });
        }
    }

    const togglePurchase = (e?: React.MouseEvent<HTMLAnchorElement>) => {
        if (e) e.preventDefault();
        setPurchase(!purchase);
    }

    const togglePromote = () => {
        setPromote(!promote);
    }

    const toggleTransfer = () => {
        setTransfer(!transfer);
    }

    const toggleBoost = () => {
        setBoost(!boost);
    }

    const filterChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        const filter = Number(e.target.value);
        const {fetchPoints, account} = props;
        fetchPoints(account.name, filter);
    }

    //BREAKAWAY COMMUNITY LOGICS
    
    const getUserPoints = async (): Promise<any[] | undefined> => {
       
        try {
          const response: AxiosResponse | any = await getBaUserPoints(activeUser!.username, communityInfo?.profile?.name);
          console.log(response)
          if (response.status === 200) {
              const userPoints = response.data.userPoints;
              console.log(userPoints[0])
              setUserPoints(userPoints[0])
            return userPoints;
          } else if (response.status === 404) {
            if (response.data.error === 'User not found') {
            } else if (response.data.error === 'Community not found for this user') {
            }
          }
      
          return undefined;
        } catch (error) {
          console.error('Error fetching user points:', error);
          throw error;
        }
      };

      const claimPoints = async () => {
        setClaimed(false)
        setClaiming(true)
        try {
          const response = await claimBaPoints(activeUser!.username, communityInfo?.profile?.name)
          console.log(response)
      
          if (response.status === 200) {
            console.log('Unclaimed points claimed successfully:', response.data);
            success(_t('points.claim-ok'));
            setClaimed(true)
            setClaiming(false)
            return response.data;
          } else {
            console.error('Claiming points failed:', response.data.message);
            throw new Error('Claiming points failed');
        }
    } catch (error) {
            success(_t('g.server-error'));
          console.error('Error claiming points:', error);
          throw error;
        }
      };

      const getPointsHistory = async (username: string, community: string) => {
        try {
          const response = await axios.get(`http://localhost:4000/points-history/${username}/${community}`);
      
          console.log('Points fetched successfully:', response.data.pointsHistory);
          if (response.status === 200) {
            setPointsHistory(response.data.pointsHistory)
            return response.data;
          } else {
            console.error('Error fetching points hisory:', response.data.message);
            throw new Error('Fetching points failed');
        }
    } catch (error) {
          console.error('Error fetching points:', error);
          throw error;
        }
      };

      const getCommunity = async () => {
        const communityData = await getAccount(props.global.hive_id)
        setCommunityInfo(communityData)
      }
      
    const isMyPage = activeUser && activeUser.username === account.name;

    // const dropDownConfig = {
    //     history: history,
    //     label: '',
    //     items: [{
    //         label: _t('points.transfer'),
    //         onClick: toggleTransfer
    //     }, {
    //         label: _t('points.promote'),
    //         onClick: togglePromote
    //     }, {
    //         label: _t('points.boost'),
    //         onClick: toggleBoost
    //     }]
    // };

    const txFilters = [
        TransactionType.CHECKIN, TransactionType.LOGIN, TransactionType.CHECKIN_EXTRA,
        TransactionType.POST, TransactionType.COMMENT, TransactionType.VOTE,
        TransactionType.REBLOG, TransactionType.DELEGATION, TransactionType.REFERRAL,
        TransactionType.COMMUNITY, TransactionType.TRANSFER_SENT, TransactionType.TRANSFER_INCOMING];
        
    return (
        <>
            <div className="wallet-ecency">
                <div className="wallet-main">
                    {/* <Button className="" onClick={()=>ls.remove("ba_access_token")} >Test Verify</Button> */}
                    <div className="wallet-info">
                        {userPoints?.unclaimedPoints > 0 && (
                            <>
                                <div className="unclaimed-rewards">
                                    <div className="title">
                                        {_t('points.unclaimed-points')}
                                    </div>
                                    <div className="rewards">
                                        <span className="reward-type">{`${userPoints?.unclaimedPoints}.000`}</span>
                                        {isMyPage && (
                                            <Tooltip content={_t('points.claim-reward-points')}>
                                                <a
                                                    className={`claim-btn ${claiming ? 'in-progress' : ''}`}
                                                    onClick={()=>{
                                                        claimPoints()
                                                        }}>
                                                    {plusCircle}
                                                </a>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>
                            </>
                         )}

                            <div className="balance-row estimated alternative">
                            <div className="balance-info">
                                <div className="title">{_t("wallet.estimated-points")}</div>
                                <div className="description">{_t("wallet.estimated-description-points")}</div>
                            </div>
                            <div className="balance-values">
                                <div className="amount amount-bold">
                                    {estimatedPointsValueLoading ? `${_t("wallet.calculating")}...` : <FormattedCurrency {...props} value={estimatedPointsValue*parseFloat(userPoints?.pointsBalance)} fixAt={3} />}
                                </div>
                            </div>
                        </div>

                        <div className="balance-row alternative">
                            <div className="balance-info">
                                <div className="title">{communityInfo?.profile?.name}</div>
                                <div className="description">{_t("points.main-description")}</div>
                            </div>
                            <div className="balance-values">
                                <div className="amount">

                                {
                                        (() => {
                                            let dropDownConfig: any
                                            if(isMyPage) {
                                                dropDownConfig = {
                                                    history: history,
                                                    label: '',
                                                    items: [{
                                                        label: _t('points.transfer'),
                                                        onClick: toggleTransfer
                                                    }, {
                                                        label: _t('points.promote'),
                                                        onClick: togglePromote
                                                    }, {
                                                        label: _t('points.boost'),
                                                        onClick: toggleBoost
                                                    }]
                                                };
                                            } else if (activeUser) {
                                                dropDownConfig = {
                                                    history: history,
                                                    label: '',
                                                    items: [{
                                                        label: _t('points.transfer'),
                                                        onClick: toggleTransfer
                                                    }]
                                                };
                                            }
                                            return (
                                                <div className="amount-actions">
                                            <DropDown {...dropDownConfig} float="right"/>
                                        </div>
                                            )
                                        })()
                                    }


                                    {/* {isMyPage && (
                                        <div className="amount-actions">
                                            <DropDown {...dropDownConfig} float="right"/>
                                        </div>
                                    )} */}

                                    <>{userPoints?.pointsBalance}.000 {"RALLY POINTS"}</>
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
                            {/* {isMyPage && (
                                <div className="buy-points">
                                    <a href="#" onClick={togglePurchase}> {_t('points.get')}</a>
                                </div>
                            )} */}
                        </div>

                        <div className="p-transaction-list">
                            <div className="transaction-list-header">
                                <h2>{_t('points.history')}</h2>
                                <FormControl as="select" value={points.filter} onChange={filterChanged}>
                                    <option value="0">{_t("points.filter-all")}</option>
                                    {txFilters.map(x => <option key={x} value={x}>{_t(`points.filter-${x}`)}</option>)}
                                </FormControl>
                            </div>

                            {(() => {
                                if (points.loading) {
                                    return <LinearProgress/>
                                }

                                return <div className="transaction-list-body">
                                    {pointsHistory?.map((tr: any) => <TransactionRow history={history} tr={tr} key={tr.id}/>)}
                                    {/* <TransactionRow history={history} /> */}
                                    {/* {(!points.loading && points.transactions.length === 0) && <p className="text-muted empty-list">{_t('g.empty-list')}</p>} */}
                                </div>
                            })()}
                        </div>
                    </div>
                    {/* // } */}

                    <WalletMenu global={global} username={account.name} active="ecency" communityInfo={communityInfo}/>
                </div>

                {transfer && (<Transfer
                    {...props}
                    mode="transfer"
                    asset="POINT"
                    activeUser={activeUser!}
                    to={isMyPage ? undefined : account.name}
                    onHide={toggleTransfer}/>)
                }

                {purchase && (<Purchase {...props} activeUser={activeUser!} onHide={togglePurchase}/>)}
                {promote && (<Promote {...props} activeUser={activeUser!} onHide={togglePromote}/>)}
                {boost && (<Boost {...props} activeUser={activeUser!} onHide={toggleBoost}/>)}
            </div>
        </>
    );
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
        updateWalletValues: p.updateWalletValues,
        addAccount: p.addAccount,
        updateActiveUser: p.updateActiveUser,
        setSigningKey: p.setSigningKey
    }

    return <WalletEcency {...props} />;
}

