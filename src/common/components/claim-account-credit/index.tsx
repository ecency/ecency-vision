import React, { useState } from "react"
import { Button } from "react-bootstrap"
import { plusCircle } from "../../img/svg"
import { _t } from "../../i18n"
import { claimAccount } from "../../api/operations";
import "./index.scss"

const ClaimAccountCredit = (props: any) => {
  const { account } = props;

  const [isClaimed, setIsClaimed] = useState(true)

  const claimCredit = async () => {

    try {
      const data = await claimAccount("codetester","test")
      console.log("claiming credits...", data)
      
    } catch (error) {
      console.log(error)
    }
    // setIsClaimed(false)
  }

  return (
    <>
      {isClaimed && <div>
          <span className="mr-1">You have unclaimed account credits</span>
          <Button 
            className="ml-1"
            onClick={claimCredit}
          >
            {account.pending_claimed_accounts} {plusCircle}
          </Button>
      </div>}
    </>
  )
}

export default ClaimAccountCredit