import React from "react";

import {History} from "history";

import isEqual from "react-fast-compare";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {ActiveUser} from "../../store/active-user/types";
import {Subscription} from "../../store/subscriptions/types";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import ProfileLink from "../profile-link";

import LinearProgress from "../linear-progress";
import Tag from "../tag";
import {error} from "../feedback";

import {getReferrals, ReferralItem} from '../../api/private-api';


import {_t} from "../../i18n";
import {Link} from "react-router-dom";
import { Tsx } from '../../i18n/helper';
import moment from 'moment';


interface Props {
    global: Global;
    history: History;
    activeUser: ActiveUser | null;
    account: Account;
}

interface State {
    referrals: ReferralItem[];
    referred: string;
    loading: boolean;
}


export class ProfileReferrals extends BaseComponent<Props, State> {
    state: State = {
        loading: true,
        referred: "",
        referrals: []
    };

    componentDidMount() {
        this.load();
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return !isEqual(this.props.account, nextProps.account)
            || !isEqual(this.props.activeUser, nextProps.activeUser)
            || !isEqual(this.state, nextState);
    }

    load = async () => {
        this.stateSet({loading: true});
        await this.getReferrals();
    }

    getReferrals = async ()=>{
        try {
          const {activeUser} = this.props;
           // Fetch referrals
           const data = await getReferrals(activeUser?.username)
           this.stateSet({referrals: data.data, loading: false});
        } catch (error) {
            console.log('Something went wrong: ',error)
        }
    }
    
    openTransferDialog = (x,y,z) =>{
        
    }
  
    render() {
        //  Meta config
        const metaProps = {
            title: _t("referral.page-title"),
            description: _t("referral.page-description"),
        };

        const {global, activeUser} = this.props;
        const {referrals, loading, proxy} = this.state;
        

        const table = <><table className="table d-none d-sm-block">
            <thead>
            <tr>
                <th className="col-rank">
                    {_t("referral.list-id")}
                </th>
                <th className="col-rank">
                    {_t("referral.created")}
                </th>
                <th>
                    {_t("referral.list-referral")}
                </th>
                <th className="col-miss">
                    {_t("referral.link")}
                </th>
                <th className="col-version">
                {_t("referral.rewarded")}
                </th>
                <th className="col-version">
                
                </th>
                
            </tr>
            </thead>
            <tbody>
            {referrals.map((row, i) => {
            var dateObj = new Date(row.created);
            var momentObj = moment(dateObj);
            var createdAt = momentObj.format('YYYY/MM/DD');
                return <tr key={i}>
                    <td>
                        <div className="witness-rank">
                            <span className="rank-number">{row.id}</span>
                            
                        </div>
                    </td>
                    <td>
                        <div className="witness-rank">
                            <span className="rank-number">
                            {createdAt}
                            </span>
                            
                        </div>
                    </td>
                    <td>
                        {ProfileLink({
                            history: this.props.history,
                            addAccount: () => {},
                            username: row.username,
                            children: <a>{UserAvatar({global: global, size: "medium", username: row.username})}</a>
                        })}
                    </td>
                    {/* To user profile */}
                    <td>
                        {(() => {
                            

                            return (
                                <a target="_external" href={'http/localhost:3000/referrals'} className="witness-link">{openInNewSvg}</a>
                            );
                        })()}
                    </td>
                    <td className="align-middle">
                    <span className="bg-secondary reward-wrapper py-1 px-3 circle">{row.rewarded}</span>
                    </td>
                    <td className="delegate-button">
                    <button className="btn btn-sm btn-primary" onClick={() => this.openTransferDialog('delegate', 'HP', row.username)}>Delegate HP</button>
                    </td>
                </tr>
            })}
            </tbody>
        </table>
        <div className="d-md-none">
        {/* Mobile Screen */}
        {/* {referrals.map((row, i) => {
            return <ReferralCard
                    referral={row.name}
                    row={row}
                    key={i}
                    global={global}
                    />
        })} */}
        </div>
        </>;

        const header = <div className="page-header mt-5">
            <div className="header-title">
                {_t('referral.page-title')}
            </div>
            <Tsx k="referral.page-description-long"><div className="header-description" /></Tsx>
        </div>;
        let containerClasses = global.isElectron ? " mt-0 pt-6" : "";

        return (
            <div className={"app-content witnesses-page" + containerClasses}>
                {(() => {
                    if (loading) {
                        return <>
                            {header}
                            <LinearProgress/>
                        </>
                    }

                    return <>
                        {header}
                        <div className="table-responsive witnesses-table">{table}</div>
                    </>
                })()}
            </div>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        global: p.global,
        history: p.history,
        activeUser: p.activeUser,
        account: p.account,
    }

    return <ProfileReferrals {...props} />;
}
