import React, { useEffect, useState } from "react"
import { getAllActiviies } from '../../api/hive'
import "./index.scss"

export const ProfileActivites = () => {

  const [activities, setActivities] = useState([])

  useEffect(() => {
  getActivities();
  }, [])

  const getActivities = async () => {
    try {
      const response = await getAllActiviies("adesojisouljay")
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
      return accountHistory;
      
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="profile-activities">
        <div className="activities-container">
            {/* <div className="activities">
              <p>The post body always</p>
              <div className="activities-details">
                <span>Authour: @adesojisouljay</span>
                <span>Permlink: pidhjhxc</span>
                <span>Post Link: @adesojisouljay/iuhdiu-dusdj-jhjh</span>
                <span>Time: 4 days ago</span>
              </div>
            </div> */}
          {activities?.map((a: any) => {return (
            <>
              {a.type === "comment" ? <div className="activities">
                <div className="activity-body">
                  <p>{a.data.body.substring(0, 100)}</p>
                </div>
                <div className="activities-details">
                  <span>Authour: {a.data.author}</span>
                  <span>Permlink: pidhjhxc</span>
                  <span>Post Link: @adesojisouljay/iuhdiu-dusdj-jhjh</span>
                  <span>Time: 4 days ago</span>
                </div>
              </div> : null}
            </>
          )})}
        </div>
    </div>
  )
}
