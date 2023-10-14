import React from 'react'
import { dateToFullRelative } from '../../helper/parse-date';
import { Link } from 'react-router-dom';
import { upvote, ticketSvg, starSvg, peopleSvg, commentSvg, chevronDownSvgForSlider } from '../../img/svg';
import { Account } from '../../store/accounts/types';
import { ActivityTypes } from './types/types';
import { _t } from '../../i18n';
  
interface Props {
    a: ActivityTypes;
    account: Account;
    jsonData: any;
}

const UserActivities = (props: Props) => {

    const { a, account, jsonData } = props;

  return (
        <>
            {a?.type === "comment" && a?.author === account!.name ? <>
            <div className="activities-info-wrapper">
                <div className="activities-details">
                    <div className="activity-icon">
                        {commentSvg}
                    </div>
                    <div className="activity-info">
                        <div>
                            <span>{_t("profile-activities.comment")}</span>
                            <Link to={`/${a.parent_permlink}/@${a.author}/${a.permlink}`}>
                                {a.parent_permlink} 
                            </Link>
                            <span>{_t("profile-activities.by")}</span>
                            <Link 
                                to={`/@${a.parent_author === "" ? a.author : a.parent_author}`} 
                                className="ml-1">
                                    @{a.parent_author === "" ? a.author : a.parent_author}
                            </Link>
                        </div>
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
                        <div>
                            <Link to={`/@${a?.author}`} className="ml-1">@{a?.author}</Link>
                            <span>{_t("profile-activities.replied")}</span>
                            <Link to={`/${a.parent_permlink}/@${a.author}/${a.permlink}`}>
                                {a.parent_permlink} 
                            </Link>
                            <span>{_t("profile-activities.by")}</span>
                            <Link 
                                to={`/@${a.parent_author === "" ? a.author : a.parent_author}`} 
                                className="ml-1">
                                    @{a.parent_author === "" ? a.author : a.parent_author}
                            </Link>
                        </div>
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
                            <span>{_t("profile-activities.voted")}</span>
                            <a href={`${window.origin}/@${a.author}/${a.permlink}`}>
                                {a.permlink} 
                            </a>
                            <span>{_t("profile-activities.by")}</span>
                            <Link to={`/@${a.author}`} className="ml-1">@{a.author}</Link>
                        </div>
                        <div>
                            <span>{dateToFullRelative(a.timestamp)}</span>
                        </div>
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
                        <div>
                            <span>{_t("profile-activities.received",  {n: a.payment} )}</span>
                            <Link to={`/@${a.payer}`} className="ml-1">@{a.payer}</Link>
                        </div>
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
                        <div>
                            <span>{_t("profile-activities.follow")}</span>
                            <Link to={`/@${jsonData[1].following}`} className="ml-1">@{jsonData[1].following}</Link>
                        </div>
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
                        <div>
                            <span>{_t("profile-activities.unfollow")}</span>
                            <Link to={`/@${jsonData[1].following}`} className="ml-1">@{jsonData[1].following}</Link>
                        </div>
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
                        <div>
                            <span>{_t("profile-activities.subscribed")}</span>
                            <Link to={`/created/${jsonData[1]?.community}`} className="ml-1">{jsonData[1]?.community}</Link>
                        </div>
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
                        <div>
                            <span>{_t("profile-activities.unsubscribed")}</span>
                            <Link to={`/created/${jsonData[1]?.community}`} className="ml-1">{jsonData[1]?.community}</Link>
                        </div>
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
                        <div>                            
                            <span>{_t("profile-activities.witness-vote")}</span>
                            <Link to={`/@${a.witness}`} className="ml-1">@{a.witness}</Link>
                        </div>
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
                        <div>                            
                            <span>{_t("profile-activities.witness-unvote")}</span>
                            <Link to={`/@${a.witness}`} className="ml-1">@{a.witness}</Link>
                        </div>
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
                        <div>
                            <span>{_t("profile-activities.approved")}</span>
                            <Link to={`/proposals/${a.proposal_ids}`} className="ml-1">proposal#{a.proposal_ids}</Link>
                        </div>
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
                        <div>
                            <span>{_t("profile-activities.unapproved")}</span>
                            <Link to={`/proposals/${a?.proposal_ids}`} className="ml-1">proposal#{a?.proposal_ids}</Link>
                        </div>
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
                        <div>
                            <Link to={`/@${a?.account}`}>@{a?.account}</Link>
                            <span>{_t("profile-activities.update")}</span>
                        </div>
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