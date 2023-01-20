import React, { useEffect, useState} from 'react'
import { _t } from '../../i18n';

const EngineTokensList = (props: any) => {
    const { token, addToFavorite, hideModal } = props;
    
    
    useEffect(() => {
    }, []);

    const addToken = () => {
        addToFavorite(token); 
        hideModal();
    }
  return (
    <>
    <div className="list-body container cursor-pointer">
        <div className="token-list">
          <img src={token.icon} />
          <span className="item-name notransalte cursor-pointer">
            {token.name}
          </span>                      
        </div>
        <div className='add-btn'>
            <button
            onClick={addToken}
            >Add {token.symbol}</button>
        </div>
    </div>   
    </>
  )
}

export default EngineTokensList;