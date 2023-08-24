import React from 'react'
import { dateToFullRelative } from '../../helper/parse-date';
import { Link } from 'react-router-dom';
import { upvote, ticketSvg, starSvg, peopleSvg, commentSvg, chevronDownSvgForSlider } from '../../img/svg';
import { Account } from '../../store/accounts/types';
import { ActivityTypes } from './types/types';
  

interface Props {
    a: ActivityTypes;
    account: Account;
    jsonData: any;
}

const UserActivities = (props: Props) => {

    const { a, account, jsonData } = props;
    console.log(account)

  return (
        <>
            {a?.type === "comment" && a?.author === account!.name ? <>
            <div className="activities-info-wrapper">
                <div className="activities-details">
                <div className="activity-icon">
                    {commentSvg}
                </div>
                <div className="activity-info">
                    <span>
                    <span> commented on </span>
                    <Link to={`/${a.parent_permlink}/@${a.author}/${a.permlink}`}>
                        {a.parent_permlink} 
                    </Link>
                    <span> by </span>
                    <Link 
                        to={`/@${a.parent_author === "" ? a.author : a.parent_author}`} 
                        className="ml-1">
                            @{a.parent_author === "" ? a.author : a.parent_author}
                    </Link>
                    </span>
                    <div>
                        <span>{dateToFullRelative(a.timestamp)}</span>
                    </div>
                </div>
                </div>
            </div>
            </> 
            : a?.type === "comment" && a?.author !== account?.name ? <>
            <div className="activities-info-wrapper">
                <div className="activities-details">
                <div className="activity-icon">
                    {commentSvg}
                </div>
                <div className="activity-info">
                <span>
                    <Link to={`/@${a?.author}`} className="ml-1">@{a?.author}</Link>
                    <span> replied to </span>
                    <Link to={`/${a.parent_permlink}/@${a.author}/${a.permlink}`}>
                        {a.parent_permlink} 
                    </Link>
                    <span> by </span>
                    <Link 
                        to={`/@${a.parent_author === "" ? a.author : a.parent_author}`} 
                        className="ml-1">
                            @{a.parent_author === "" ? a.author : a.parent_author}
                    </Link>
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
                        <a href={`${window.origin}/@${a.author}/${a.permlink}`}>
                            {a.permlink} 
                        </a>
                        <span> by </span>
                        <Link to={`/@${a.author}`} className="ml-1">@{a.author}</Link>
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
                    <span> received {a.payment} from </span>
                    <a href="#" className="ml-1">@{a.payer}</a>
                    </span>
                    <div>
                    <span>{dateToFullRelative(a.timestamp)}</span>
                    </div>
                </div>
                </div>
            </div>
            </>
            : (a?.id === "follow" && jsonData[1]!?.what?.includes("blog")) ? <>
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
            : (a?.id === "follow" && !jsonData[1]?.what?.includes("blog")) ? <>
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
            : (a?.id === "community" && jsonData?.includes("subscribe")) ? <>
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
            :( a?.id === "community" && jsonData?.includes("unsubscribe")) ? <>
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
            : (a?.type === "account_witness_vote" && a?.approve) ? <>
            <div className="activities-info-wrapper">
                <div className="activities-details">
                <div className="activity-icon text-light">
                    {upvote}
                </div>
                <div className="activity-info">
                    <span>                            <span> voted witness </span>
                    <Link to={`/@${a.witness}`} className="ml-1">@{a.witness}</Link>
                    </span>
                    <div>
                    <span>{dateToFullRelative(a.timestamp)}</span>
                    </div>
                </div>
                </div>
            </div>
            </> 
            : (a?.type === "account_witness_vote" && !a?.approve) ? <>
            <div className="activities-info-wrapper">
                <div className="activities-details">
                <div className="activity-icon">
                    <div className="downvote-icon">
                        <span>
                             {chevronDownSvgForSlider}
                        </span>
                    </div>
                </div>
                <div className="activity-info">
                    <span>                            <span> unvoted witness </span>
                    <Link to={`/@${a.witness}`} className="ml-1">@{a.witness}</Link>
                    </span>
                    <div>
                    <span>{dateToFullRelative(a.timestamp)}</span>
                    </div>
                </div>
                </div>
            </div>
            </> 
            : (a?.type === "update_proposal_votes" && a?.approve) ? <>
            <div className="activities-info-wrapper">
                <div className="activities-details">
                <div className="activity-icon">
                    {upvote}
                </div>
                <div className="activity-info">
                    <span>
                    <span> approved </span>
                    <Link to={`/proposals/${a.proposal_ids}`} className="ml-1">proposal#{a.proposal_ids}</Link>
                    </span>
                    <div>
                    <span>{dateToFullRelative(a.timestamp)}</span>
                    </div>
                </div>
                </div>
            </div>
            </> 
            : (a?.type === "update_proposal_votes" && !a?.approve) ? <>
            <div className="activities-info-wrapper">
                <div className="activities-details">
                <div className="activity-icon">
                    <div className="downvote-icon">
                        <span>
                             {chevronDownSvgForSlider}
                        </span>
                    </div>
                </div>
                <div className="activity-info">
                    <span>
                    <a href="#">@{a.voter}</a>
                    <span> unapproved </span>
                    <Link to={`/proposals/${a?.proposal_ids}`} className="ml-1">proposal#{a?.proposal_ids}</Link>
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
                    <a href="#">@{a?.account}</a>
                    <span> updated their account</span>
                    </span>
                    <div>
                    <span>{dateToFullRelative(a.timestamp)}</span>
                    </div>
                </div>
                </div>
            </div>
            </> 
            : <></>}
        </>
  )
}

export default UserActivities;