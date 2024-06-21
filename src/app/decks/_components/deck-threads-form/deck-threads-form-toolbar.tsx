import React, { useContext, useState } from "react";
import { DeckThreadsFormToolbarImagePicker } from "./deck-threads-form-toolbar-image-picker";
import { DeckThreadsFormEmojiPicker } from "./deck-threads-form-emoji-picker";
import { Button } from "@ui/button";
import { UilChart } from "@iconscout/react-unicons";
import { PollsContext, PollsCreation } from "@/features/polls";

interface Props {
  onAddImage: (url: string, name: string) => void;
  onEmojiPick: (value: string) => void;
  onAddVideo: (value: string) => void;
}

export const DeckThreadsFormToolbar = ({ onAddImage, onEmojiPick, onAddVideo }: Props) => {
  const { activePoll, setActivePoll, clearActivePoll } = useContext(PollsContext);
  const [show, setShow] = useState(false);

  return (
    <div className="deck-threads-form-toolbar">
      <DeckThreadsFormToolbarImagePicker onAddImage={onAddImage} />
      <DeckThreadsFormEmojiPicker onPick={onEmojiPick} />
      {/*<DeckThreadsFormToolbarVideoPicker onSelect={onAddVideo} />*/}
      <Button appearance="gray-link" icon={<UilChart />} onClick={() => setShow(true)} />
      <PollsCreation
        existingPoll={activePoll}
        show={show}
        setShow={setShow}
        onAdd={setActivePoll}
        onDeletePoll={clearActivePoll}
      />
    </div>
  );
};
