import React, { useEffect, useState } from "react"
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
import { fetchActvities } from "./operations"
import { ActivitiesGroup } from "./types/activities-group"
import { Global } from "../../store/global/types";

interface Props{
  account: Account;
  global: Global;
}

export const ProfileActivites = (props: Props) => {

  const { account, global } = props;

  const [activities, setActivities] = useState<ActivityTypes[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ActivitiesGroup | "">("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [activityId, setActivityId] = useState("")

  useEffect(() => {
    userActivities(-1);
  },[filter]);

  const userActivities = async (start: number) => {
    setLoading(true);
    
    try {
      const data = await fetchActvities(account!.name, filter, start, 20);
      const filterNotifications = data?.filter((a: ActivityTypes) => a?.id !== "notify" && a?.id !== "ecency_notify");
      
      if (filterNotifications?.length > 0) {
        setActivityId(filterNotifications[0].trx_id); 
          if (!filter) {
            setIsFiltered(false)
            setActivities(prevActivities => [...prevActivities, ...filterNotifications]);
          } else {
            setIsFiltered(true)
            
            const filterNewActivities = [...filteredActivities, ...filterNotifications].filter((a: ActivityTypes) => a.type === filter)
            setFilteredActivities(filterNewActivities);
          }
      }

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  
  const handleLoadMore = () => {
    const lastActivity = activitiesToMap[activitiesToMap?.length - 1];
    if (canLoadMore) {
      userActivities(lastActivity.num);
    }
  };

  const handleCustomJson = (a: ActivityTypes) => {
    let jsonData;
      try {
        if(a?.json){
          jsonData = JSON.parse(a?.json)
        };              
      } catch (error) {
        console.log(error)
      }
      return jsonData
  };

  const activitiesToMap: ActivityTypes[] = !isFiltered ? activities : filteredActivities
  const canLoadMore = activityId !== activitiesToMap[activitiesToMap?.length - 1]?.trx_id

  return (
    <>
      {loading && <LinearProgress/>}
        <div className="activities-container mt-3">
          <div className="activities-page-info">
            <span>Activities related to <Link to={`/@${account?.name}`}>@{account?.name}'s</Link> account</span>
          </div>
          <div className={!global.isMobile ? "activities-bottom" : "activity-bottom-column"}>
            <div className="activities-wrapper">
              {activitiesToMap?.map((a: ActivityTypes, i: number) => {
                  const jsonData = handleCustomJson(a)
                return (
                  <div className="activities" key={i}>
                    <UserActivities a={a} account={account} jsonData={jsonData} />
                  </div>
              )})}
              {!loading && <div className="d-flex mt-3 align-self-center">
                <Button 
                className="w-100"
                disabled={loading || !canLoadMore}
                onClick={() => handleLoadMore()}
                >Load more</Button>
              </div>}
            </div>
            <div className="activities-filter">
              <div className="filter-dropdown">
                  <ActivitiesDropdown setFilter={setFilter} />                
              </div>
              <div className="types-container">
                <ActivitiesTypes account={account} global={global} />
              </div>
            </div>
          </div>
        </div>
    </>
  )
}
