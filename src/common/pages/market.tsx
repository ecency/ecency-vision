import React, { useEffect, useState } from 'react';
import { NavBar } from '../components/navbar';
import NavBarElectron from "../../desktop/app/components/navbar";
import { connect } from 'react-redux';
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from './common';
import { ChartStats } from '../components/chart-stats';
import { HiveBarter } from '../components/hive-barter';
import { getMarketStatistics, MarketStatistics } from '../api/hive';
import { Skeleton } from '../components/skeleton';

const MarketPage = (props: PageProps) => {
    const [data, setData] = useState<MarketStatistics | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        setLoading(true)
        getMarketStatistics().then(res=>{
            setLoading(false);
            setData(res)
        })
    }, []);
    const {global} = props;

    let navbar = global.isElectron ?
        NavBarElectron({
            ...props,
            reloadFn: () => {},
            reloading: false,
        }) : <NavBar {...props} />
    return <div className="d-flex justify-content-center">
                <div className="w-75">
                    <div>{navbar}</div>
                    <div style={{marginTop: 70}}>
                        <ChartStats data={data} loading={loading} />
                    </div>
                    <div style={{height: 200}} className="border rounded mt-5 text-center d-flex align-items-center justify-content-center">Chart goes here</div>
                    <div className="container my-3">
                        <div className="row justify-content-between">
                            <div className="col-12 col-sm-5 p-0">
                                <HiveBarter
                                    type={1}
                                    available={0.009}
                                    peakValue={data? parseFloat(data!.lowest_ask) :0}
                                    loading={loading}
                                />
                            </div>
                            <div className="col-12 col-sm-5 p-0">
                                <HiveBarter
                                    type={2}
                                    available={0.009}
                                    peakValue={data? parseFloat(data!.highest_bid) :0}
                                    loading={loading}
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(MarketPage as any);