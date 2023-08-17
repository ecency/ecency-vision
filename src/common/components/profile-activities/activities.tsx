import React from 'react'
import { dateToFullRelative } from '../../helper/parse-date';
import { Link } from 'react-router-dom';
import { upvote, ticketSvg, starSvg, peopleSvg, commentSvg } from '../../img/svg';

const UserActivities = (props: any) => {
    const { a, account, jsonData, i } = props;

  return (
        <div className="activities">
            {a?.type === "comment" && a?.data.parent_author === "" ? <>
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
            </> 
            : a?.type === "comment" && a?.data.author !== account?.name ? <>
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
            </> 
            : a?.type === "vote" ? <>
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
            </> 
            : a?.type === "proposal_pay" ? <>
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
            </>
            : (a?.data.id === "follow" && jsonData[1]!?.what?.includes("blog")) ? <>
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
            </> 
            : (a?.data.id === "follow" && !jsonData[1]?.what?.includes("blog")) ? <>
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
            </> 
            : (a?.data.id === "community" && jsonData?.includes("subscribe")) ? <>
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
            </> 
            :( a?.data.id === "community" && jsonData?.includes("unsubscribe")) ? <>
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
            </>
            : (a?.type === "account_witness_vote" && a?.data.approve) ? <>
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
            </> 
            : (a?.type === "account_witness_vote" && !a?.data.approve) ? <>
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
            </> 
            : (a?.type === "update_proposal_votes" && a?.data.approve) ? <>
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
            </> 
            : (a?.type === "update_proposal_votes" && !a?.data.approve) ? <>
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
            </> 
            : a?.type === "account_update2" ? <>
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
            </> 
            : <>{jsonData[1][0]}</>}
        </div>
  )
}

export default UserActivities;