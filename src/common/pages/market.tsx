import React, { useEffect, useState } from 'react';
import { NavBar } from '../components/navbar';
import NavBarElectron from "../../desktop/app/components/navbar";
import { connect } from 'react-redux';
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from './common';
import { ChartStats } from '../components/chart-stats';
import { HiveBarter } from '../components/hive-barter';
import { getMarketStatistics, getOpenOrder, getOrderBook, getTradeHistory, MarketStatistics, OpenOrdersData, OrdersData } from '../api/hive';
import { FullAccount } from '../store/accounts/types';
import { Orders } from '../components/orders';
import { OpenOrders } from '../components/open-orders';
import SSRSuspense from '../components/ssr-suspense';
import { Skeleton } from '../components/skeleton';
import { _t } from '../i18n';
import { Button, ButtonGroup } from 'react-bootstrap';

const MarketChart = React.lazy(()=> import ("../components/market-chart"));

const MarketPage = (props: PageProps) => {
    const [data, setData] = useState<MarketStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [bidValues, setBidValues] = useState<any>({lowest: 0, highest: 0});
    const [openOrdersdata, setopenOrdersdata] = useState<OpenOrdersData[]>([]);
    const [openOrdersDataLoading, setopenOrdersDataLoading] = useState(false);
    const [tablesData, setTablesData] = useState<OrdersData | null>(null);
    const [loadingTablesData, setLoadingTablesData] = useState(false);
    const [exchangeType, setExchangeType] = useState(1);
    const {global, activeUser} = props;

    useEffect(()=>{
        setLoading(true);
        setLoadingTablesData(true);
        setopenOrdersDataLoading(true)
        updateData();
        setInterval(()=>updateData(), 20000)
    }, []);

    useEffect(()=>{
        data && setBidValues({lowest: parseFloat(data!.lowest_ask), highest: parseFloat(data!.highest_bid)})
    },[data])

    const updateData = () => {
        getMarketStatistics().then(res=>{
            setLoading(false);
            setData(res)
        });
        getOrderBook().then(res => {
            getTradeHistory().then(trading => {
                setLoadingTablesData(false);
                setTablesData({...res, trading});
            })});
        activeUser && getOpenOrder(activeUser.username).then(res=>{
            setopenOrdersdata(res);
            setopenOrdersDataLoading(false);
        })
    }
    
    let navbar = global.isElectron ?
        NavBarElectron({
            ...props,
            reloadFn: () => {},
            reloading: false,
        }) : <NavBar {...props} />;
        
    return <>
            <div className="d-flex justify-content-center">
                <div className="w-75">
                    <div style={{marginBottom: '6rem'}}>{navbar}</div>
                    <div className='mb-5'>
                        <h2>{_t("market.title")}</h2>
                        <p>{_t("market.description")}</p>
                    </div>
                    <div className='d-flex justify-content-md-between flex-column flex-md-row'>
                        <div className='mb-5'>
                            <h4 className='mb-3'>{loading ? <Skeleton className='skeleton-loading'/> : "Stock information"}</h4>
                            <ChartStats data={data} loading={loading} />
                        </div>

                        {(data && tablesData) ? <SSRSuspense fallback={<div>Loading chunked component...</div>}>
                                <MarketChart bids={tablesData!.bids || []} asks={tablesData!.asks || []} theme={global.theme} />
                            </SSRSuspense> : "Loading..."}
                    </div>
                    <div className='d-flex justify-content-center'>
                        <div className="container my-5 mx-0">
                            <div>
                                {activeUser && <div className="row justify-content-between d-none d-md-flex">
                                    <div className="col-12 col-sm-5 p-0">
                                        <HiveBarter
                                            type={1}
                                            available={activeUser && (activeUser.data as FullAccount).balance || ""}
                                            peakValue={parseFloat(bidValues.lowest)}
                                            basePeakValue={data ? parseFloat(data!.lowest_ask): 0}
                                            loading={loading}
                                            username={activeUser!.username}
                                            onClickPeakValue={()=>setBidValues({...bidValues, lowest: data ? parseFloat(data!.lowest_ask): 0})}
                                        />
                                    </div>
                                    <div className="col-12 col-sm-5 p-0">
                                        <HiveBarter
                                            type={2}
                                            available={activeUser && (activeUser.data as FullAccount).hbd_balance || ""}
                                            peakValue={parseFloat(bidValues.highest)}
                                            basePeakValue={data ? parseFloat(data!.highest_bid): 0}
                                            loading={loading}
                                            username={activeUser!.username}
                                            onClickPeakValue={()=>setBidValues({...bidValues, highest: data ? parseFloat(data!.highest_bid): 0})}
                                        />
                                    </div>
                                </div>}

                                {activeUser && <div className='d-flex flex-column d-md-none'>
                                        <div className='d-flex align-items-sm-center justify-content-start justify-content-sm-between flex-column flex-sm-row'>
                                            <h3>Exchange tokens</h3>
                                            <ButtonGroup size="lg" className="my-3">
                                                <Button className="mr-3" variant={exchangeType === 1 ? "primary" : 'secondary'} onClick={()=>setExchangeType(1)}>Buy</Button>
                                                <Button variant={exchangeType === 2 ? "primary" : 'secondary'} onClick={()=>setExchangeType(2)}>Sell</Button>
                                            </ButtonGroup>
                                        </div>

                                        {exchangeType === 1 ? <HiveBarter
                                            type={1}
                                            available={activeUser && (activeUser.data as FullAccount).balance || ""}
                                            peakValue={parseFloat(bidValues.lowest)}
                                            basePeakValue={data ? parseFloat(data!.lowest_ask): 0}
                                            loading={loading}
                                            username={activeUser!.username}
                                            onClickPeakValue={()=>setBidValues({...bidValues, lowest: data ? parseFloat(data!.lowest_ask): 0})}
                                        /> : <HiveBarter
                                        type={2}
                                        available={activeUser && (activeUser.data as FullAccount).hbd_balance || ""}
                                        peakValue={parseFloat(bidValues.highest)}
                                        basePeakValue={data ? parseFloat(data!.highest_bid): 0}
                                        loading={loading}
                                        username={activeUser!.username}
                                        onClickPeakValue={()=>setBidValues({...bidValues, highest: data ? parseFloat(data!.highest_bid): 0})}
                                    />}
                                </div>}

                                <div className="row mt-5">
                                    {!openOrdersDataLoading && openOrdersdata.length>0 && <div className="col-12 px-0 mb-5"><OpenOrders data={openOrdersdata || []} loading={openOrdersDataLoading} username={(activeUser && activeUser.username) || ""}/></div>}
                                    <div className="col-12 col-lg-6 pl-sm-0"><Orders onPriceClick={(value)=> setBidValues({...bidValues,lowest:value})} type={1} loading={loadingTablesData} data={tablesData ? tablesData!.bids : []}/></div>
                                    <div className="col-12 col-lg-6 pl-0 pl-sm-auto mt-5 mt-lg-0"><Orders onPriceClick={(value)=>setBidValues({...bidValues, highest:value})} type={2} loading={loadingTablesData} data={tablesData ? tablesData!.asks : []}/></div>
                                    <div className="col-12 px-0 px-sm-auto mt-5"><Orders type={3} loading={loadingTablesData} data={tablesData ? tablesData!.trading : []}/></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(MarketPage as any);