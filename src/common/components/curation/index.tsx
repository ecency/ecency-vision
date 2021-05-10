import React from "react";
import {History} from "history";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import ProfileLink from "../profile-link"

import {getCuration, CurationDuration, CurationItem} from "../../api/private-api";

import {informationSvg} from "../../img/svg";
import DropDown from "../dropdown";
import Tooltip from "../tooltip";
import LinearProgress from "../linear-progress";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names"
import {vestsToHp} from "../../helper/vesting";
import formattedNumber from "../../util/formatted-number";
import { getAccounts } from '../../api/hive';

interface Props {
    global: Global;
    history: History;
    dynamicProps: DynamicProps;
    addAccount: (data: Account) => void;
}

interface State {
    data: CurationItem[],
    period: CurationDuration,
    loading: boolean
}

export class Curation extends BaseComponent<Props, State> {

    state: State = {
        data: [],
        period: "day",
        loading: true
    }

    componentDidMount() {
        this.fetch();
    }

    compare = (a: CurationItem, b: CurationItem) => {
        return b.efficiency - a.efficiency;
    }

    fetch = () => {
        const {period} = this.state;
        this.stateSet({loading: true, data: []});

        getCuration(period).then(data => {
            const accounts = data.map((item) => item.account);
            getAccounts(accounts).then(res => {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];
                    const curator = data[index];
                    const effectiveVest: number = parseFloat(element.vesting_shares) + parseFloat(element.received_vesting_shares) - parseFloat(element.delegated_vesting_shares) - parseFloat(element.vesting_withdraw_rate);
                    curator.efficiency = curator.vests / effectiveVest;
                }
                data.sort(this.compare);
                this.stateSet({data});
                this.stateSet({loading: false});
            });
        });
    }

    render() {

        const {data, period, loading} = this.state;
        const {dynamicProps} = this.props;
        const {hivePerMVests} = dynamicProps;

        const menuItems = [
            ...["day", "week", "month"].map((f => {
                return {
                    label: _t(`leaderboard.period-${f}`),
                    onClick: () => {
                        this.stateSet({period: f as CurationDuration});
                        this.fetch();
                    }
                }
            }))
        ]

        const dropDownConfig = {
            history: this.props.history,
            label: '',
            items: menuItems
        };

        return (
            <div className={_c(`leaderboard-list ${loading ? "loading" : ""}`)}>
                <div className="list-header">
                    <div className="list-filter">
                        {_t('curation.title')} <DropDown {...dropDownConfig} float="left"/>
                    </div>
                    <div className="list-title">
                        {_t(`curation.title-${period}`)}
                    </div>
                </div>
                {loading && <LinearProgress/>}
                {data.length > 0 && (
                    <div className="list-body">
                        <div className="list-body-header">
                            <span/>
                            <Tooltip content={_t('curation.header-score-tip')}>
                            <span className="score">
                                {informationSvg} {_t('curation.header-score')}
                            </span>
                            </Tooltip>
                            <span className="points">
                               {_t('curation.header-reward')}
                            </span>
                        </div>

                        {data.map((r, i) => {

                            return <div className="list-item" key={i}>
                                <div className="index">{i + 1}</div>
                                <div className="avatar">
                                    {ProfileLink({
                                        ...this.props,
                                        username: r.account,
                                        children: <a>{UserAvatar({...this.props, size: "medium", username: r.account})}</a>
                                    })}
                                </div>
                                <div className="username">
                                    {ProfileLink({
                                        ...this.props,
                                        username: r.account,
                                        children: <a>{r.account}</a>
                                    })}
                                </div>
                                <div className="score">
                                    {r.votes}
                                </div>
                                <div className="points">
                                    {formattedNumber(vestsToHp(r.vests, hivePerMVests), {suffix: "HP"})}
                                </div>
                            </div>;
                        })}
                    </div>
                )}

            </div>
        );
    }
}


export default (p: Props) => {
    const props: Props = {
        global: p.global,
        history: p.history,
        dynamicProps: p.dynamicProps,
        addAccount: p.addAccount
    };

    return <Curation {...props} />
}
