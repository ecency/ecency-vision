import React, { useEffect, useState } from "react"
import { getAllActiviies } from "../../api/hive"
import { dateToFullRelative } from "../../helper/parse-date"
import "./index.scss"
import { Link } from "react-router-dom"
import LinearProgress from "../linear-progress"
import { Account } from "../../store/accounts/types"
import { Button } from "react-bootstrap"
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import activeUser from "../../store/active-user"
import { Transaction } from "@hiveio/dhive"
import { DynamicProps } from "../../store/dynamic-props/types"

// interface Props{
// }

export const ProfileActivites = (props: any) => {

  const { account } = props;

  const [activities, setActivities] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(props)
    getActivities();
  },[]);

  const getActivities = async () => {
    setLoading(true);
    const types = [
      "comment",
      "proposal_pay",
      "vote",
      "custom_json",
      "account_witness_vote",
      "update_proposal_votes",
      "account_update2"
    ];
  
    try {
      const response = await getAllActiviies(account.name);
      const accountHistory = response.map((entry: [any, any]) => {
        const [index, op] = entry;
        const { timestamp, block } = op;
        const type = op.op[0];
        const data = op.op[1];
        console.log(type)
  
        if (types.includes(type)) {
          return {
            index,
            timestamp,
            block,
            type,
            data,
          };
        } else {
          return null;
        }
      });
  
      const filteredAccountHistory = accountHistory.filter((entry: any) => entry !== null);
  
      console.log(accountHistory);
      setActivities(filteredAccountHistory.reverse());
      setLoading(false);
      return filteredAccountHistory;
    } catch (err) {
      console.log(err);
    }
  };

  const handleCustomJson = (a: any): any => {
    let jsonData;
      try {
        if(a?.data?.json){
          jsonData = JSON.parse(a?.data?.json)
          console.log(jsonData)
        };              
      } catch (error) {
        console.log(error)
      }
      return jsonData
  }

  return (
    <>
      {loading && <LinearProgress/>}
        <div className="activities-container">
          <div className="activities-page-info">
            <span>All activities related to <Link to={`/@${account?.name}`}>@{account?.name}'s</Link> account</span>
          </div>
          {activities?.map((a: any, i: number) => {
           const jsonData = handleCustomJson(a)
            return (
            <div key={i}>
              {a?.type === "comment" && a.data.author === account?.name && a.data.parent_author !== "" ? <div className="activities">
                <div className="activities-header">
                  <h4>Comment</h4>
                </div>
                <div className="activities-info-wrapper">
                  <div className="activities-details">
                    <div>
                      {ProfileLink({
                        ...props,
                        username: a.data.author,
                        children: <UserAvatar username={a.data.author} size="medium" />
                      })}
                    </div>
                    <div className="activity-info">
                      <span>
                        <Link to="#">@{a.data.author}</Link>
                        <span> commented on </span>
                        <Link to={`/${a.data.parent_permlink}/@${a.data.author}/${a.data.permlink}`}>
                          {a.data.parent_permlink} 
                        </Link>
                        <span> by </span>
                        <a href="#" className="ml-1">@{a.data.parent_author === "" ? a.data.author : a.data.parent_author}</a>
                      </span>
                      <div>
                        <span>Time: {dateToFullRelative(a.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div> 
              : a?.type === "comment" && a.data.parent_author === account?.name && a.data.author !== account?.name ? <div className="activities">
                <div className="activities-header">
                  <h4>Reply</h4>
                </div>
                <div className="activities-info-wrapper">
                  <div className="activities-details">
                    <div>
                      {ProfileLink({
                        ...props,
                        username: a.data.author,
                        children: <UserAvatar username={a.data.author} size="medium" />
                      })}
                    </div>
                    <div className="activity-info">
                    <span>
                      <a href="#">@{a.data.author}</a>
                      <span> replied to </span>
                      <Link to={`/${a.data.parent_permlink}/@${a.data.author}/${a.data.permlink}`}>
                        {a.data.parent_permlink} 
                      </Link>
                      <span> by </span>
                      <a href="#" className="ml-1">@{a.data.parent_author === "" ? a.data.author : a.data.parent_author}</a>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                    </div>
                  </div>
                </div>
              </div> 
             : a?.type === "vote" && a.data.voter === account?.name ? <div className="activities">
              <div className="activities-header">
                <h4>Vote</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                    <div>
                      {ProfileLink({
                        ...props,
                        username: account?.name,
                        children: <UserAvatar username={account?.name} size="medium" />
                      })}
                    </div>
                    <div className="activity-info">
                      <div>
                        <Link to="#">@{a.data.voter}</Link>
                        <span> voted on </span>
                        <Link to={`/@${a.data.author}/${a.data.permlink}`}>
                          {a.data.permlink} 
                        </Link>
                        <span> by </span>
                        <a href="#" className="ml-1">@{a.data.author}</a>
                      </div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                </div>
              </div>
            </div> 
             : a?.type === "proposal_pay" ? <div className="activities">
              <div className="activities-header">
                <h4>Proposal pay</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">
                    <span>
                      <a href="#">@{a.data.receiver}</a>
                      <span> received {a.data.payment} from </span>
                      <a href="#" className="ml-1">@{a.data.payer}</a>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
             : (a?.data.id === "follow" && jsonData[1]!?.what?.includes("blog")) ? <div className="activities">
              <div className="activities-header">
                <h4>Follow</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">                    
                    <span>
                      <a href="#">@{jsonData[1]?.follower}</a>
                      <span> started following </span>
                      <a href="#" className="ml-1">@{jsonData[1].following}</a>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
             : (a?.data.id === "follow" && !jsonData[1]?.what?.includes("blog")) ? <div className="activities">
              <div className="activities-header">
                <h4>Unfollow</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">
                    <span>
                      <a href="#">@{jsonData[1].follower}</a>
                      <span> unfollowed </span>
                      <a href="#" className="ml-1">@{jsonData[1].following}</a>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
             : (a?.data.id === "community" && jsonData?.includes("subscribe")) ? <div className="activities">
              <div className="activities-header">
                <h4>Subscribe</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">
                    <span>
                      <Link to="#">@{account?.name}</Link>
                      <span> Subscribed to community</span>
                      <Link to={`/created/${jsonData[1]?.community}`} className="ml-1">{jsonData[1]?.community}</Link>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
             :( a?.data.id === "community" && jsonData?.includes("unsubscribe")) ? <div className="activities">
              <div className="activities-header">
                <h4>Unsubscribe</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">
                    <span>
                      <Link to="#">@{account?.name}</Link>
                      <span> unsubscribed from community</span>
                      <Link to={`/created/${jsonData[1]?.community}`} className="ml-1">{jsonData[1]?.community}</Link>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
             : (a?.type === "account_witness_vote" && a?.data.approve) ? <div className="activities">
              <div className="activities-header">
                <h4>Witness Vote</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">
                    <span>
                      <a href="#">@{a.data.account}</a>
                      <span> voted witness </span>
                      <Link to={`/@${a.data.witness}`} className="ml-1">@{a.data.witness}</Link>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
             : (a?.type === "account_witness_vote" && !a?.data.approve) ? <div className="activities">
              <div className="activities-header">
                <h4>Unapprove witness Vote</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">
                    <span>
                      <a href="#">@{a.data.account}</a>
                      <span> unvoted witness </span>
                      <Link to={`/@${a.data.witness}`} className="ml-1">@{a.data.witness}</Link>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
             : (a?.type === "update_proposal_votes" && a?.data.approve) ? <div className="activities">
              <div className="activities-header">
                <h4>Approve proposal</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">
                    <span>
                      <a href="#">@{a.data.voter}</a>
                      <span> approved </span>
                      <Link to={`/proposals/${a.data.proposal_ids}`} className="ml-1">proposal#{a.data.proposal_ids}</Link>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
             : (a?.type === "update_proposal_votes" && !a?.data.approve) ? <div className="activities">
              <div className="activities-header">
                <h4>Unapprove proposal</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">
                    <span>
                      <a href="#">@{a.data.voter}</a>
                      <span> unapproved </span>
                      <Link to={`/proposals/${a?.data.proposal_ids}`} className="ml-1">proposal#{a?.data.proposal_ids}</Link>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
             : a?.type === "account_update2" ? <div className="activities">
              <div className="activities-header">
                <h4>Account update</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <div>
                    {ProfileLink({
                      ...props,
                      username: account?.name,
                      children: <UserAvatar username={account?.name} size="medium" />
                    })}
                  </div>
                  <div className="activity-info">
                    <span>
                      <a href="#">@{a?.data.account}</a>
                      <span> updated their account</span>
                    </span>
                    <div>
                      <span>Time: {dateToFullRelative(a.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
            : <></>}
            </div>
          )})}
        </div>
        {!loading && <div className="justify-self-center mt-3">
          <Button className="w-100">Load more</Button>
        </div>}
    </>
  )
}
