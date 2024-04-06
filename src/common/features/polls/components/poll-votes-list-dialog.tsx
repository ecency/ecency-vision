import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import React, { useMemo, useState } from "react";
import { _t } from "../../../i18n";
import { Entry } from "../../../store/entries/types";
import { useGetPollDetailsQuery } from "../api";
import { List, ListItem } from "@ui/list";
import { Button } from "@ui/button";
import UserAvatar from "../../../components/user-avatar";
import { Link } from "react-router-dom";
import { Badge } from "@ui/badge";

interface Props {
  entry?: Entry;
}

export function PollVotesListDialog({ entry }: Props) {
  const { data: poll } = useGetPollDetailsQuery(entry);

  const [show, setShow] = useState(false);
  const [chosenChoice, setChosenChoice] = useState<string>();

  const pollChoices = useMemo(() => poll?.poll_choices ?? [], [poll?.poll_choices]);
  const pollVotes = useMemo(
    () =>
      (poll?.poll_voters ?? []).filter((vote) =>
        chosenChoice
          ? chosenChoice ===
            pollChoices.find((pc) => pc.choice_num === vote.choice_num)?.choice_text
          : true
      ),
    [poll?.poll_voters, chosenChoice, pollChoices]
  );

  return (
    <>
      <Button appearance="link" size="sm" onClick={() => setShow(true)}>
        {_t("polls.show-voters")}
      </Button>
      <Modal centered={true} show={show} onHide={() => setShow(false)}>
        <ModalHeader closeButton={true}>{_t("polls.votes-list")}</ModalHeader>
        <ModalBody>
          <div className="pb-4 flex flex-wrap gap-2">
            {pollChoices.map((choice) => (
              <Badge
                className="cursor-pointer"
                key={choice.choice_text}
                appearance={choice.choice_text === chosenChoice ? "primary" : "secondary"}
                onClick={() =>
                  setChosenChoice(
                    choice.choice_text === chosenChoice ? undefined : choice.choice_text
                  )
                }
              >
                <span>{choice.votes?.total_votes ?? 0}</span>
                {choice.choice_text}
              </Badge>
            ))}
          </div>
          <List defer={true} inline={true} grid={true}>
            {pollVotes.map((vote) => (
              <ListItem styledDefer={true} key={vote.name}>
                <Link to={`/@${vote.name}`} className="flex items-start gap-3">
                  <UserAvatar size="w-8 h-8" username={vote.name} />
                  <div className="flex flex-col">
                    <span>{vote.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {pollChoices.find((pc) => pc.choice_num === vote.choice_num)?.choice_text}
                    </span>
                  </div>
                </Link>
              </ListItem>
            ))}
          </List>
        </ModalBody>
      </Modal>
    </>
  );
}
