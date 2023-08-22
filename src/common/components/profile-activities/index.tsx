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

interface Props{
  account: Account;
}

export const ProfileActivites = (props: Props) => {

  const { account } = props;

  const [activities, setActivities] = useState<ActivityTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ActivitiesGroup | "">("")

  useEffect(() => {
    newActivities();
  },[filter]);

 
  const newActivities = async () => {
    setLoading(true)

    try {
      const data = await fetchActvities(account!.name, filter, -1, 20);

      setActivities(data);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }

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
                <Button 
                className="w-100"
                onClick={() => console.log("Loading more...")}
                >Load more</Button>
              </div>}
            </div>
            <div className="activities-filter">
              <div className="filter-dropdown">
                  <ActivitiesDropdown setFilter={setFilter} />                
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
