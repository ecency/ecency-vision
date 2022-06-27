import React from "react";

import {connect} from "react-redux";

import moment, {Moment} from "moment";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Feedback from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import Transfer, {TransferMode, TransferAsset} from "../components/transfer";


import {_t} from "../i18n";
import {Tsx} from "../i18n/helper";
import parseDate from "../helper/parse-date";

import {linkSvg, openInNewSvg} from "../img/svg";

import {pageMapDispatchToProps, pageMapStateToProps, PageProps} from "./common";
import activeUser from "../store/active-user";
import {getReferrals, ReferralItem} from '../api/private-api';

interface Props {
  updateWalletValues: () => void;
}

interface State {
    referrals: ReferralItem[];
    proxy: string | null;
    transfer: boolean;
    referred: string;
    transferMode: null | TransferMode;
    transferAsset: null | TransferAsset;
    loading: boolean;
}

class ReferralPage extends BaseComponent<PageProps, State> {
    state: State = {
        referrals: [],
        proxy: null,
        transfer: false,
        referred: '',
        transferAsset: 'HP',
        transferMode: 'delegate',
        loading: true
    }

    componentDidMount() {
        this.load();
    }

    componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<State>, snapshot?: any) {
        // active user changed
        if (this.props.activeUser?.username !== prevProps.activeUser?.username) {
            this.stateSet({loading: true}, () => {
                this.load();
            })
        }
    }

    load = async () => {
        this.stateSet({loading: true});

        const {activeUser} = this.props;
        

        const referrals:[] = []
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

    openTransferDialog = (mode: TransferMode, asset: TransferAsset, user:string) => {
      this.stateSet({transfer: true, transferMode: mode, transferAsset: asset, referred: user});
    }

    closeTransferDialog = () => {
        this.stateSet({transfer: false, transferMode: null, transferAsset: null});
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
                            ...this.props,
                            username: row.username,
                            children: <span className="witness-card notranslate"> {UserAvatar({
                                ...this.props,
                                username: row.username,
                                size: "medium"
                            })}
                                <div className={'witness-ctn'}>
                                  {row.username}
                                </div>
                            </span>
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
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                        reloadFn: this.load,
                        reloading: loading,
                    }) :
                    NavBar({...this.props})}
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
                {this.state.transfer && <Transfer {...this.props} activeUser={this.props.activeUser!} to={this.state.referred} mode={this.state.transferMode!} asset={this.state.transferAsset!} onHide={this.closeTransferDialog}/>}

            </>
        );
    }
}


export default connect(pageMapStateToProps, pageMapDispatchToProps)(ReferralPage);
