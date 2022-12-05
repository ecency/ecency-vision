import React, { useEffect, useState } from 'react'
import { Modal, Button, FormControl } from 'react-bootstrap'
import { getRCDelegations } from "../../api/hive";
import { delegateRCKc } from '../../api/operations';
import { _t } from '../../i18n';
import LinearProgress from '../linear-progress';
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import { useParams } from 'react-router';

export const RcDelegationsInList = (props: any) => {
  const limit = 50;
  const params: any = useParams();

  const { activeUser, rcFormatter, showDelegation } = props

  const [outGoingList, setOutGoingList]: any = useState();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [search, setsearch] = useState("")

  useEffect (() => {
    getRcList();   
  }, [])

  const getRcList = async () => {
    setLoading(true)
    const paramsAccount = params.username.substring(1)
    const delegationsOutList: any = await getRCDelegations(paramsAccount, "")
        const delegationsOutInfo = delegationsOutList.rc_direct_delegations;
        setOutGoingList(delegationsOutInfo);
        setLoading(false);
        setHasMore(delegationsOutInfo.length > limit);        
        return delegationsOutInfo;
  };

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

            <div className="list-body">
               {outGoingList?.filter((list: any) => 
               list.to.toLowerCase().startsWith(search)
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
                      {activeUser && (<div>
                      <span className="item-reputation">{rcFormatter(list.delegated_rc)}</span>     
                      <a className="item-reputation cursor-pointer"
                      onClick={showDelegation}
                      >{_t("rc-info.update")}</a>          
                      <a className="item-reputation cursor-pointer"
                      onClick={() => delegateRCKc(activeUser.username, list.to, 0)}
                      >{_t("rc-info.delete")}</a>          
                      </div>)}               
                   </div>
                 </div>                   
               </div>
               ))
               }             
            </div>
            <div className="load-more">
              <Button disabled={loading || !hasMore}>
                {_t("g.load-more")}
              </Button>
            </div>
          </div>      
    </div>
  ) 
}
