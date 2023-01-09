import React, { useEffect, useState } from 'react'
import { Modal, Button, FormControl } from 'react-bootstrap'
import { getOutgoingRc, getIncomingRc } from "../../api/hive";
import { delegateRCKc } from '../../api/operations';
import { _t } from '../../i18n';
import LinearProgress from '../linear-progress';
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import { useParams } from 'react-router';

export const RcDelegationsList = (props: any) => {
  // const limit = 21;
  const params: any = useParams();

  const { activeUser, rcFormatter, showDelegation, listMode, setToFromList, setAmountFromList } = props

  const [outGoingList, setOutGoingList]: any = useState([]);
  const [incoming, setIncoming]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [search, setsearch] = useState("");
  const [loadList, setLoadList] = useState(21);

  useEffect (() => {
    getOutGoingRcList();   
    getIncomingRcList();
  }, [])

  const getOutGoingRcList = async () => {
    setLoading(true)
    const paramsAccount = params.username.substring(1)
    const delegationsOutList: any = await getOutgoingRc(paramsAccount, "")
        const delegationsOutInfo = delegationsOutList.rc_direct_delegations;
        setOutGoingList(delegationsOutInfo);
        setHasMore(delegationsOutInfo.length > loadList);        
        setLoading(false);
  };

  const getIncomingRcList = async () => {
    setLoading(true)
    const paramsAccount = params.username.substring(1)
    const delegationsIn: any = await getIncomingRc(paramsAccount)
    const incomingInfo = delegationsIn.list
    console.log(incomingInfo)
        setIncoming(incomingInfo);
        setHasMore(incomingInfo.length > loadList);        
        setLoading(false);
  };

  const loadMore = () => {
    const moreList = loadList + 7;
    setLoadList(moreList)
  }

  return (   
      <div className="list-content">
          {loading && (
            <div className="loading">
              <LinearProgress />
            </div>
          )}
        <div className="list">
            <div className="list-search-box">
              <FormControl     
                value={search}
                placeholder="search list"
                onChange={(e) => setsearch(e.target.value)}
              />
            </div>

            {listMode === "out" && <div className="list-body"> 
               {outGoingList?.slice(0, loadList).filter((list: any) => 
               list.to.toLowerCase().startsWith(search) || list.to.toLowerCase().includes(search)
               ).map((list: any, i: any) =>(
                 <div className="list-item" key={i}>
                 <div className="item-main">
                   {ProfileLink({
                     ...props,
                     username: list.to,
                     children: <>{UserAvatar({ ...props, username: list.to, size: "small" })}</>
                   })}
                   <div className="item-info">
                     {ProfileLink({
                       ...props,
                       username: list.to,
                       children: <a className="item-name notransalte">{list.to}</a>
                     })}
                      <span className="item-reputation">{rcFormatter(list.delegated_rc)}</span>     
                      {list.from === activeUser.username && (<>
                      <a className="item-reputation cursor-pointer"
                      onClick={() => {
                        showDelegation()
                        setToFromList(list.to)
                        setAmountFromList(list.delegated_rc)
                      }}
                      >{_t("rc-info.update")}</a>          
                      <a className="item-reputation cursor-pointer"
                      onClick={() => delegateRCKc(activeUser.username, list.to, 0)}
                      >{_t("rc-info.delete")}</a>          
                      </>)}               
                   </div>
                 </div>                   
               </div>
               ))
               }             
            </div>}

            {listMode === "in" && <div className="list-body"> 
               {incoming?.slice(0, loadList).filter((list: any) => 
               list.sender.toLowerCase().startsWith(search) || list.sender.toLowerCase().includes(search)
               ).map((list: any, i: any) =>(
                 <div className="list-item" key={i}>
                 <div className="item-main">
                   {ProfileLink({
                     ...props,
                     username: list.sender,
                     children: <>{UserAvatar({ ...props, username: list.sender, size: "small" })}</>
                   })}
                   <div className="item-info">
                     {ProfileLink({
                       ...props,
                       username: list.sender,
                       children: <a className="item-name notransalte">{list.sender}</a>
                     })}
                      <span className="item-reputation">{rcFormatter(list.amount)}</span>     
                   </div>
                 </div>                   
               </div>
               ))
               }             
            </div>}

            {(hasMore && outGoingList.length > loadList) && 
            <div className="load-more">
              <Button disabled={loading || !hasMore} onClick={loadMore}>
                {_t("g.load-more")}
              </Button>
            </div>}
          </div>      
    </div>
  ) 
};
