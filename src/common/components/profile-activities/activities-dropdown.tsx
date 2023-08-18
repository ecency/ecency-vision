import React, { useState } from 'react'
import DropDown from "../dropdown"

interface Props {
  
}

const ActivitiesDropdown = (props: Props) => {

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
        <div className="dropdown-header">
            <h5>Filter activities</h5>
        </div>
        {dropDown}
    </>
  )
}

export default ActivitiesDropdown