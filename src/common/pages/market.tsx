import React, { useEffect } from 'react';
import { NavBar } from '../components/navbar';
import NavBarElectron from "../../desktop/app/components/navbar";
import { connect } from 'react-redux';
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from './common';
import { ChartStats } from '../components/chart-stats';
import { getMarketStatistics } from '../api/hive';

const MarketPage = (props: PageProps) => {
    const {global} = props;

    let navbar = global.isElectron ?
        NavBarElectron({
            ...props,
            reloadFn: () => {},
            reloading: false,
        }) : <NavBar {...props} />
    return <div>
                <div>{navbar}</div>
                <div style={{marginTop: 70}}><ChartStats /></div>
            </div>
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(MarketPage as any);