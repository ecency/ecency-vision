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
import { upvote, commentSvg, ticketSvg, starSvg, peopleSvg } from "../../img/svg"
import DropDown from "../dropdown"
import { _t } from "../../i18n"
import UserActivities from "./activities"

// interface Props{
// }

export const ProfileActivites = (props: any) => {

  const { account } = props;

  const [activities, setActivities] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState("")

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
        // console.log(filterTypes, r[1].op[0])
        return filterTypes;

      });
      const accountHistory = filterResponse.map((entry: [any, any]) => {
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

      const filterNotifications = accountHistory.filter((a: any) => a?.data.id !== "notify" && a?.data.id !== "ecency_notify")
    
      setActivities(filterNotifications.reverse());
      setLoading(false);
      return filterNotifications;
    } catch (err) {
      console.log(err);
    }
  };

  const handleCustomJson = (a: any): any => {
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

  const dropDown = (
    <div className="mb-2">
      <div>
        {(() => {
          let dropDownConfig: any;
          dropDownConfig = {
            history: "",
            label: label ? label : "All",
            items: [
              {
                label: <span>Comments</span>,
                onClick: () => {
                  setLabel("Comments");
                }
              },
              {
                label: <span>Replies</span>,
                onClick: () => {
                  setLabel("Replies");
                }
              },
              {
                label: <span>Likes</span>,
                onClick: () => {
                  setLabel("Likes");
                }
              },
              {
                label: <span>Follows</span>,
                onClick: () => {
                  setLabel("Follows");
                }
              },
              {
                label: <span>Communities</span>,
                onClick: () => {
                  setLabel("Communities");
                }
              },
              {
                label: <span>Curation rewards</span>,
                onClick: () => {
                  setLabel("Curation rewards");
                }
              },
              {
                label: <span>Witness votes</span>,
                onClick: () => {
                  setLabel("Witness votes");
                }
              },
              {
                label: <span>Proposal votes</span>,
                onClick: () => {
                  setLabel("Proposal votes");
                }
              }
            ]
          };
          return (
            <div className="dropdown-wrapper">
              <DropDown {...dropDownConfig} float="top" />
            </div>
          );
        })()}
      </div>
    </div>
  );

  return (
    <>
      {loading && <LinearProgress/>}
        <div className="activities-container mt-3">
          <div className="activities-page-info">
            <span>Activities related to <Link to={`/@${account?.name}`}>@{account?.name}'s</Link> account</span>
          </div>
          <div className="activities-bottom">
            <div className="activities-wrapper">
              {activities?.map((a: any, i: number) => {
                // console.log(a)
                  const jsonData = handleCustomJson(a)
                  // console.log(jsonData)
                return (
                    <UserActivities a={a} acctount={account} jsonData={jsonData} key={i} />
              )})}
              {!loading && <div className="d-flex mt-3 align-self-center">
                <Button className="w-100">Load more</Button>
              </div>}
            </div>
            <div className="activities-filter">
              <div className="filter-dropdown">
                <div className="dropdown-header">
                  <h5>Filter activities</h5>
                </div>
                <div>
                  {dropDown}
                </div>
              </div>
              <div className="filter-container">
                <div className="filter-header">
                  <h5>Activity Types</h5>
                </div>
                <div className="filter-wrapper">
                  <div className="filter-types">
                    <Link to={`/@${account?.name}/comments`}>Comments</Link>
                    <Link to={`/@${account?.name}/replies`}>Replies</Link>
                    <Link to={`/@${account?.name}/trail`}>Votes</Link>
                    <Link to={`/@${account?.name}/communities`}>Communities</Link>
                  </div>
                  <div className="filter-types">
                    <Link to={`/`}>Follows</Link>
                    <Link to={`/`}>Witness votes</Link>
                    <Link to={`/`}>Proposal votes</Link>
                  </div>
                  <div className="filter-types">
                    <Link to={`/`}>Curation rewards</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </>
  )
}
