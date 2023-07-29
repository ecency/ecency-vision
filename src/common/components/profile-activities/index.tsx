import React, { useEffect, useState } from "react"
import { getAllActiviies } from "../../api/hive"
import { dateToFullRelative } from "../../helper/parse-date"
import "./index.scss"
import { Link } from "react-router-dom"
import LinearProgress from "../linear-progress"
import { Account } from "../../store/accounts/types"
import { Button } from "react-bootstrap"

interface Props{
  account: Account
}

export const ProfileActivites = (props: Props) => {

  const { account } = props;

  const [activities, setActivities] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  getActivities();
  },[])

  const getActivities = async () => {
    setLoading(true)
    try {
      const response = await getAllActiviies(account.name)
      console.log(response.reverse())
      const accountHistory = response.map((entry: [any, any]) => {
        const [index, op] = entry;
        const { timestamp, block } = op;
        const type = op.op[0];
        const data = op.op[1];
  
        return {
          index,
          timestamp,
          block,
          type,
          data,
        };
      });
      console.log(accountHistory.reverse())
      setActivities(accountHistory.reverse())
      setLoading(false)
      return accountHistory;
      
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="profile-activities">
      {loading && <LinearProgress/>}
        <div className="activities-container">
          {activities?.map((a: any) => {return (
            <>
              {a.type === "comment" ? <div className="activities">
                <div className="activities-header">
                  <h4>Comment</h4>
                </div>
                <div className="activities-info-wrapper">
                  <div className="activities-details">
                    <span>Authour: @{a.data.author}</span>
                    <span>Body: {a.data.body.substring(0, 100)}</span>
                    <span>Permlink: {a.data.permlink}</span>
                    <span className="mr-1">Post Link: 
                      <Link to={`/@${a.data.author}/${a.data.permlink}`}>{`/@${a.data.author}/${a.data.permlink}`}</Link>
                    </span>
                    <span>Time: {dateToFullRelative(a.timestamp)}</span>
                  </div>
                </div>
              </div> 
              : a.type === "effective_comment_vote" ? <div className="activities">
                <div className="activities-header">
                  <h4>Effective comment vote</h4>
                </div>
                <div className="activities-info-wrapper">
                  <div className="activities-details">
                    <span>Authour: @{a.data.author}</span>
                    <span>Pending payout: {a.data.pending_payout}</span>
                    <span>Post Link: {a.data.permlink}</span>
                    <span>Voter: {a.data.voter}</span>
                    <span>Time: {dateToFullRelative(a.timestamp)}</span>
                  </div>                  
                </div>
            </div> : a.type === "vote" ? <div className="activities">
              <div className="activities-header">
                <h4>Vote</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <span>Authour: @{a.data.author}</span>
                  <span>Post permlink: {a.data.permlink}</span>
                  <span>Voter: {a.data.voter}</span>
                  <span>Weight: {a.data.weight / 100}%</span>
                  <span>Time: {dateToFullRelative(a.timestamp)}</span>
                </div>
              </div>
            </div> : a.type === "curation_reward" ? <div className="activities">
              <div className="activities-header">
                <h4>Curation reward</h4>
              </div>
              <div className="activities-info-wrapper">
                <div className="activities-details">
                  <span>Authour: @{a.data.comment_author}</span>
                  <span>Post permlink: {a.data.comment_permlink}</span>
                  <span>Curator: {a.data.curator}</span>
                  <span>Reward: {a.data.reward}</span>
                  <span>Time: {dateToFullRelative(a.timestamp)}</span>
                </div>
              </div>
            </div>
              : null}
            </>
          )})}
        </div>
        <div className="justify-self-center mt-3">
          <Button className="w-100">Load more</Button>
        </div>
    </div>
  )
}
