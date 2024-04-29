import React, { useContext } from "react";
import { PollsContext } from "./hooks/polls-manager";
import { PollWidget } from "../../features/polls";

export function SubmitPollPreview() {
  const { activePoll } = useContext(PollsContext);

  return activePoll ? <PollWidget isReadOnly={true} poll={activePoll} /> : <></>;
}
