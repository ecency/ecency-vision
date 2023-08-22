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
                    label: <span>Likes</span>,
                    onClick: () => {
                      setLabel("Likes");
                      setFilter("customJson");
                    }
                  },
                  {
                    label: <span>Follows</span>,
                    onClick: () => {
                      setLabel("Follows");
                      setFilter("customJson");
                    }
                  },
                  {
                    label: <span>Communities</span>,
                    onClick: () => {
                      setLabel("Communities");
                      setFilter("customJson");
                    }
                  },
                  {
                    label: <span>Curation rewards</span>,
                    onClick: () => {
                      setLabel("Curation rewards");
                      // setFilter("Curation rewards");
                    }
                  },
                  {
                    label: <span>Witness votes</span>,
                    onClick: () => {
                      setLabel("Witness votes");
                      setFilter("witnessVote");
                    }
                  },
                  {
                    label: <span>Proposal votes</span>,
                    onClick: () => {
                      setLabel("Proposal votes");
                      setFilter("proposalVote");
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