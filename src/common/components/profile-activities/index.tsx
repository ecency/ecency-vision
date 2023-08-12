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
      const accountHistory = response.map((entry: [any, any]) => {
        const [index, op] = entry;
        const { timestamp, block } = op;
        const type = op.op[0];
        const data = op.op[1];
  
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
  
      // console.log(response);
      // console.log(filteredAccountHistory);
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
        <div className="activities-container">
          <div className="activities-page-info">
            <span>Activities related to <Link to={`/@${account?.name}`}>@{account?.name}'s</Link> account</span>
          </div>
          <div className="activities-bottom">
            <div className="activities-wrapper">
              {activities?.map((a: any, i: number) => {
              const jsonData = handleCustomJson(a)
                return (
                <>
                  {
                  a?.type === "comment" && a.data.author === account?.name && a.data.parent_author !== "" ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {commentSvg}
                        </div>
                        <div className="activity-info">
                          <span>
                            <span> commented on </span>
                            <Link to={`/${a.data.parent_permlink}/@${a.data.author}/${a.data.permlink}`}>
                              {a.data.parent_permlink} 
                            </Link>
                            <span> by </span>
                            <a href="#" className="ml-1">@{a.data.parent_author === "" ? a.data.author : a.data.parent_author}</a>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  : a?.type === "comment" && a.data.parent_author === account?.name && a.data.author !== account?.name ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {commentSvg}
                        </div>
                        <div className="activity-info">
                        <span>
                          <span> replied to </span>
                          <Link to={`/${a.data.parent_permlink}/@${a.data.author}/${a.data.permlink}`}>
                            {a.data.parent_permlink} 
                          </Link>
                          <span> by </span>
                          <a href="#" className="ml-1">@{a.data.parent_author === "" ? a.data.author : a.data.parent_author}</a>
                        </span>
                        <div>
                          <span>{dateToFullRelative(a.timestamp)}</span>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  : a?.type === "vote" && a.data.voter === account?.name ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                          <div className="activity-icon">
                            {upvote}
                          </div>
                          <div className="activity-info">
                            <div>
                              <span> voted on </span>
                              <a href={`${window.origin}/@${a.data.author}/${a.data.permlink}`}>
                                {a.data.permlink} 
                              </a>
                              <span> by </span>
                              <Link to={`/@${a.data.author}`} className="ml-1">@{a.data.author}</Link>
                            </div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                      </div>
                    </div>
                  </div> 
                  : a?.type === "proposal_pay" ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {ticketSvg}
                        </div>
                        <div className="activity-info">
                          <span>
                            <span> received {a.data.payment} from </span>
                            <a href="#" className="ml-1">@{a.data.payer}</a>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  : (a?.data.id === "follow" && jsonData[1]!?.what?.includes("blog")) ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {starSvg}
                        </div>
                        <div className="activity-info">                    
                          <span>
                            <span> started following </span>
                            <a href="#" className="ml-1">@{jsonData[1].following}</a>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  : (a?.data.id === "follow" && !jsonData[1]?.what?.includes("blog")) ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {starSvg}
                        </div>
                        <div className="activity-info">
                          <span>
                            <span> unfollowed </span>
                            <a href="#" className="ml-1">@{jsonData[1].following}</a>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  : (a?.data.id === "community" && jsonData?.includes("subscribe")) ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {peopleSvg}
                        </div>
                        <div className="activity-info">
                          <span>
                            <span> Subscribed to community</span>
                            <Link to={`/created/${jsonData[1]?.community}`} className="ml-1">{jsonData[1]?.community}</Link>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  :( a?.data.id === "community" && jsonData?.includes("unsubscribe")) ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {peopleSvg}
                        </div>
                        <div className="activity-info">
                          <span>
                            <span> unsubscribed from community</span>
                            <Link to={`/created/${jsonData[1]?.community}`} className="ml-1">{jsonData[1]?.community}</Link>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  : (a?.type === "account_witness_vote" && a?.data.approve) ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon text-light">
                          {upvote}
                        </div>
                        <div className="activity-info">
                          <span>                            <span> voted witness </span>
                            <Link to={`/@${a.data.witness}`} className="ml-1">@{a.data.witness}</Link>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  : (a?.type === "account_witness_vote" && !a?.data.approve) ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {upvote}
                        </div>
                        <div className="activity-info">
                          <span>                            <span> unvoted witness </span>
                            <Link to={`/@${a.data.witness}`} className="ml-1">@{a.data.witness}</Link>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  : (a?.type === "update_proposal_votes" && a?.data.approve) ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {upvote}
                        </div>
                        <div className="activity-info">
                          <span>
                            <span> approved </span>
                            <Link to={`/proposals/${a.data.proposal_ids}`} className="ml-1">proposal#{a.data.proposal_ids}</Link>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  : (a?.type === "update_proposal_votes" && !a?.data.approve) ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {upvote}
                        </div>
                        <div className="activity-info">
                          <span>
                            <a href="#">@{a.data.voter}</a>
                            <span> unapproved </span>
                            <Link to={`/proposals/${a?.data.proposal_ids}`} className="ml-1">proposal#{a?.data.proposal_ids}</Link>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  : a?.type === "account_update2" ? <div className="activities">
                    <div className="activities-info-wrapper">
                      <div className="activities-details">
                        <div className="activity-icon">
                          {starSvg}
                        </div>
                        <div className="activity-info">
                          <span>
                            <a href="#">@{a?.data.account}</a>
                            <span> updated their account</span>
                          </span>
                          <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> 
                  : <></>
                  }
                </>
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
                    <Link to={`/`}>Follows</Link>
                  </div>
                  <div className="filter-types">
                    <Link to={`/`}>Witness votes</Link>
                    <Link to={`/`}>Proposal votes</Link>
                    <Link to={`/`}>Communities</Link>
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
