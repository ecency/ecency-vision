import React, { useEffect, useState} from 'react'
import { _t } from '../../i18n';
import "./index.scss";

const EngineTokensList = (props: any) => {
    const { token, handleChange, i, favoriteToken } = props;

    const [checked, setChecked] = useState(favoriteToken)
    
  return (
    <>
    <div className="list-body portfolio-list-container cursor-pointer">
        <div className="token-list">
          <img src={token.icon} />
          <span className="item-name notransalte cursor-pointer">
            {token?.name}
          </span>                      
        </div>
        <div className='add-btn'>
          <input
            type="checkbox"
            value={token?.name}
            checked={(checked ? true : false)}
            onChange={(e) => {
              handleChange(e.target.checked, token);
              setChecked(!checked)
            }}
          />
        </div>
    </div>   
    </>
  )
}

export default EngineTokensList;