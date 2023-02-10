import React, { useEffect, useState} from 'react'
import { _t } from '../../i18n';

const EngineTokensList = (props: any) => {
    const { token, handleOnChange, ischecked } = props;
    
  return (
    <>
    <div className="list-body portfolio-list-container cursor-pointer">
        <div className="token-list">
          <img src={token.icon} />
          <span className="item-name notransalte cursor-pointer">
            {token.name}
          </span>                      
        </div>
        <div className='add-btn'>
          <input
            type="checkbox"
            value={token?.name}
            checked={ischecked}
            onChange={(e) => handleOnChange(e, token)}
          />
        </div>
    </div>   
    </>
  )
}

export default EngineTokensList;