import React from 'react'
import { Link } from 'react-router-dom'
import { Account } from "../../store/accounts/types"
import { Global } from '../../store/global/types'

interface Props {
    account: Account;
    global: Global;
}

const ActivitiesTypes = (props: Props) => {

    const { account, global } = props;
  return (
    <div>
        <div className="d-flex justify-content-center">
            <h5 className="types-header">Activity Types</h5>
        </div>
        <div className={`types-wrapper`}>
            <div className={`${global.isMobile ? "flex-row" : "flex-column"} filter-types`}>
                <Link to={`/@${account?.name}/comments`}>Comments</Link>
                <Link to={`/@${account?.name}/replies`}>Replies</Link>
                <Link to={`/@${account?.name}/trail`}>Votes</Link>
                <Link to={`/@${account?.name}/communities`}>Communities</Link>
            </div>
            <div className={`${global.isMobile ? "flex-row" : "flex-column"} filter-types`}>
                <Link to={`/witnesses?voter=${account.name}`}>Witness votes</Link>
                <Link to={`/proposals?voter=${account.name}`}>Proposal votes</Link>
            </div>
        </div>
    </div>
  )
}

export default ActivitiesTypes