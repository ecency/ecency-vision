import React, { useContext, useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { ChatContext } from "../chat-context-provider";

export default function JoinChat() {
  const { messageServiceInstance, joinChat } = useContext(ChatContext);

  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (messageServiceInstance) {
      setShowSpinner(false);
    }
  }, [messageServiceInstance]);

  const handleJoinChat = async () => {
    setShowSpinner(true);
    joinChat();
  };

  return (
    <div className="no-chat text-center">
      <p>You haven't joined the chat yet. Please join the chat to start chatting.</p>
      <Button onClick={handleJoinChat}>
        {showSpinner && (
          <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
        )}
        Join Chat
      </Button>
    </div>
  );
}
