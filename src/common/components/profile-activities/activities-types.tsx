import React from 'react'
import { Link } from 'react-router-dom'
import { Account } from "../../store/accounts/types"

interface Props {
    account: Account;
}

const ActivitiesTypes = (props: Props) => {

    const { account } = props;
  return (
    <div>
        <div className="types-header">
            <h5>Activity Types</h5>
        </div>
        <div className="types-wrapper">
            <div className="filter-types">
                <Link to={`/@${account?.name}/comments`}>Comments</Link>
                <Link to={`/@${account?.name}/replies`}>Replies</Link>
                <Link to={`/@${account?.name}/trail`}>Votes</Link>
                <Link to={`/@${account?.name}/communities`}>Communities</Link>
            </div>
            <div className="filter-types">
                <Link to={`/witnesses?voter=${account.name}`}>Witness votes</Link>
                <Link to={`/proposals?voter=${account.name}`}>Proposal votes</Link>
            </div>
        </div>
    </div>
  )
}

export default ActivitiesTypes