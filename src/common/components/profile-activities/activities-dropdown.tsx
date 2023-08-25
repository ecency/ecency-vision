import React, { useState } from 'react'
import DropDown from "../dropdown"
import { ActivitiesGroup } from "./types/activities-group"

interface Props {
  setFilter: React.Dispatch<React.SetStateAction<"" | ActivitiesGroup>>
}

const ActivitiesDropdown = (props: Props) => {

  const { setFilter } = props;

    const [label, setLabel] = useState("")

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
                    label: <span>All</span>,
                    onClick: () => {
                      setLabel("All");
                      setFilter("");
                    }
                  },
                  {
                    label: <span>Comments</span>,
                    onClick: () => {
                      setLabel("Comments");
                      setFilter("comment");
                    }
                  },
                  {
                    label: <span>Replies</span>,
                    onClick: () => {
                      setLabel("Replies");
                      setFilter("comment");
                    }
                  },
                  {
                    label: <span>Custom json</span>,
                    onClick: () => {
                      setLabel("Follows");
                      setFilter("custom_json");
                    }
                  },
                  // {
                  //   label: <span>Likes</span>,
                  //   onClick: () => {
                  //     setLabel("Likes");
                  //     setFilter("custom_json");
                  //   }
                  // },
                  // {
                  //   label: <span>Communities</span>,
                  //   onClick: () => {
                  //     setLabel("Communities");
                  //     setFilter("custom_json");
                  //   }
                  // },
                  {
                    label: <span>Witness votes</span>,
                    onClick: () => {
                      setLabel("Witness votes");
                      setFilter("account_witness_vote");
                    }
                  },
                  {
                    label: <span>Proposal votes</span>,
                    onClick: () => {
                      setLabel("Proposal votes");
                      setFilter("update_proposal_votes");
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
        <div className="dropdown-header">
            <h5>Filter activities</h5>
        </div>
        {dropDown}
    </>
  )
}

export default ActivitiesDropdown