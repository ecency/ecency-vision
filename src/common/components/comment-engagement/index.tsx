import React, { useEffect, Ref } from 'react'
import { commentSvg } from "../../img/svg";
import { Button } from "react-bootstrap";
import { _t } from "../../i18n";
// import {EntryPage} from '../../pages/entry';

function CommentEngagement({commentInput}: any) {

  
  // const scrollToRef = (ref: any) => commentInput.current.scrollIntoView();
  const scrollToCommentInput = () => commentInput.current.scrollIntoView();
  
      useEffect(() => {
          console.log(commentInput.current)
      },[]);
   
    return ( <div className="comment-engagement">
        <div className="icon">{commentSvg}</div>
         <div className="label">{_t("discussion.no-conversation")}</div>
          <Button onClick={scrollToCommentInput}> 
            {_t("discussion.start-conversation")}
          </Button>
          
       </div>)
}

export default CommentEngagement;