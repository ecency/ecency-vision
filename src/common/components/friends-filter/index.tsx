import moment, { Moment } from 'moment'
import React, { useEffect, useState } from 'react'
import { getAccount } from '../../api/hive'
import DropDown, { MenuItem } from "../dropdown";
import { _t } from '../../i18n';

export const FriendsActiveStats = (props: any) => {
    const { item } = props

    const [lastActive, setLAstActive] = useState("");
    const [type, setType] = useState("")

    useEffect(()=> {
        getFollowerLastActive();
    },[])

    const getFollowerLastActive = async () => {
        let lastActive: Moment;
            const followerAccount = await getAccount(item.name)
            .then((data: any)=>  data)
            .catch((err: any) => console.log(err))
          
            const lastVoteTime: Moment = moment(followerAccount?.last_vote_time);
            const lastPost: Moment = moment(followerAccount?.last_post);
            const created: Moment = moment(followerAccount?.created);
          
             lastActive = moment.max(lastVoteTime, lastPost, created);
          
            console.log(lastActive.fromNow());
        
            setLAstActive(lastActive.fromNow());
    }
  return (
    <div onClick={() => getFollowerLastActive()}>
        <a  href="#">Last active: {lastActive}</a>
    </div>
  )
}

export const FilterFriends = (props: any) => {

    const { filter } = props;

    const [label, setLabel] = useState("");

    const dropDown = (
        <div className="friends-filter">
            <div className="filter-options">
            {(() => {
            let dropDownConfig: any;
            dropDownConfig = {
                history: "",
                label: label ? label : "Filter",
                items: [
                {
                    label: <span>All</span>,
                    onClick: () => {
                    setLabel("All");
                    filter("All");
                    }
                },
                {
                    label: <span>Last week</span>,
                    onClick: () => {
                    setLabel("Last week");
                    filter("Last week");
                    }
                },
                {
                    label: <span>Last month</span>,
                    onClick: () => {
                    const encoding = "encoding_ipfs" || "encoding_preparing"
                    setLabel("Last month");
                    filter("Last month");
                    }
                },
                {
                    label: <span>6 months ago</span>,
                    onClick: () => {
                    setLabel("6 months ago");
                    filter("6 months ago");
                    }
                },
                {
                    label: <span>Last year</span>,
                    onClick: () => {
                    setLabel("1 year ago");
                    filter("1 year ago");
                    }
                },
                {
                    label: (
                    <span>Over 2 years</span>
                    ),
                    onClick: () => {
                    setLabel("Over 2 years");
                    filter("Over 2 years");
                    }
                },
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
    )

  return (
    <div>{dropDown}</div>
  )
}
