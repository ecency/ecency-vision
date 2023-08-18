import React, { useEffect, useState } from "react"
import { getAllActiviies } from "../../api/hive"
import "./index.scss"
import { Link } from "react-router-dom"
import LinearProgress from "../linear-progress"
import { Account } from "../../store/accounts/types"
import { Button } from "react-bootstrap"
import { _t } from "../../i18n"
import UserActivities from "./activities"
import ActivitiesDropdown from "./activities-dropdown"
import ActivitiesTypes from "./activities-types"
import { ActivityTypes } from './types/types';

interface Props{
  account: Account;
}

export const ProfileActivites = (props: Props) => {

  const { account } = props;

  const [activities, setActivities] = useState<ActivityTypes[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
      const filterResponse = response.filter((r: any) => {
        const filterTypes = types.includes(r[1].op[0]);
        return filterTypes;

      });
      const accountHistory = filterResponse.map((entry: any) => {
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

      const filterNotifications = accountHistory.filter((a: ActivityTypes) => a?.data.id !== "notify" && a?.data.id !== "ecency_notify")
    
      setActivities(filterNotifications.reverse());
      setLoading(false);
      return filterNotifications;
    } catch (err) {
      console.log(err);
    }
  };

  const handleCustomJson = (a: ActivityTypes) => {
    let jsonData;
      try {
        if(a?.data?.json){
          jsonData = JSON.parse(a?.data?.json)
        };              
      } catch (error) {
        console.log(error)
      }
      return jsonData
  };

  return (
    <>
      {loading && <LinearProgress/>}
        <div className="activities-container mt-3">
          <div className="activities-page-info">
            <span>Activities related to <Link to={`/@${account?.name}`}>@{account?.name}'s</Link> account</span>
          </div>
          <div className="activities-bottom">
            <div className="activities-wrapper">
              {activities?.map((a: ActivityTypes, i: number) => {
                  const jsonData = handleCustomJson(a)
                return (
                  <div className="activities" key={i}>
                    <UserActivities a={a} account={account} jsonData={jsonData} />
                  </div>
              )})}
              {!loading && <div className="d-flex mt-3 align-self-center">
                <Button className="w-100">Load more</Button>
              </div>}
            </div>
            <div className="activities-filter">
              <div className="filter-dropdown">
                  <ActivitiesDropdown  />                
              </div>
              <div className="types-container">
                <ActivitiesTypes account={account} />
              </div>
            </div>
          </div>
        </div>
    </>
  )
}
