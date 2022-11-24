import React, { useEffect, useState } from 'react'
import { Modal, Button, FormControl } from 'react-bootstrap'
import { getRCDelegations } from "../../api/hive";
import { _t } from '../../i18n';
import LinearProgress from '../linear-progress';
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";

export const RcDelegationsInList = (props: any) => {

  const limit = 50;

  const { resourceCredit, activeUser, hideDelegation } = props

  const [outGoingList, setOutGoingList]: any = useState();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  // const [list, setList] = useState([])

  useEffect (() => {
    console.log(activeUser)
    getRcList()
  }, [])

  const getRcList = async () => {
    setLoading(true)
    const delegationsOutList: any = await getRCDelegations(activeUser.username, "")
        const delegationsOutInfo = delegationsOutList.rc_direct_delegations
        console.log(delegationsOutInfo.length)
        setOutGoingList(delegationsOutInfo)
        setLoading(false)
        setHasMore(delegationsOutInfo.length > limit)
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
                // value={search}
                placeholder="search list"
                // onChange={this.searchChanged}
                // onKeyDown={this.searchKeyDown}
              />
            </div>

            <div className="list-body">
               {outGoingList?.map((list: any, i: any) =>(
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
                      <span className="item-reputation">{list.delegated_rc}</span>          
                      <a className="item-reputation cursor-pointer">Update delegation</a>          
                   </div>
                 </div>
               </div>
               ))
               }             
            </div>
            {/* {!inSearch && data.length > 1 && ( */}
            <div className="load-more">
              <Button disabled={loading || !hasMore}>
                {_t("g.load-more")}
              </Button>
            </div>
          {/* )} */}
          </div>
    </div>
  )
 
}
