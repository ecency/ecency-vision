import { _t } from "../../../i18n";
import { Alert } from "@ui/alert";
import { FormControl } from "@ui/input";
import React, { useState } from "react";
import { Button } from "@ui/button";
import { DirectContact } from "@ecency/ns-query";
import { useInviteViaPostComment } from "../mutations";

interface Props {
  currentContact: DirectContact;
}

export function ChatInvitation({ currentContact }: Props) {
  const [initiatedInviting, setInitiatedInviting] = useState(false);
  const [invitationText, setInvitationText] = useState(
    "Hi! Let's start messaging privately. Register an account on [https://ecency.com/chats](https://ecency.com/chats)"
  );

  const {
    mutateAsync: invite,
    isLoading: isInviting,
    isSuccess: isInvited
  } = useInviteViaPostComment(currentContact?.name);

  return (
    <div className="flex flex-col justify-center text-center items-center p-4">
      <div className="font-bold">{_t("chat.welcome.oops")}</div>
      <div className="text-gray-600 dark:text-gray-400 mb-4">
        {_t("chat.welcome.user-not-joined-yet")}
      </div>
      {!isInvited &&
        (initiatedInviting ? (
          <div className="flex flex-col gap-4 items-center">
            <Alert>{_t("chat.specify-invitation-message")}</Alert>
            <FormControl
              type="textarea"
              value={invitationText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInvitationText(e.target.value)
              }
            />
            <Button
              outline={true}
              size="sm"
              disabled={isInviting}
              onClick={async () => {
                await invite(invitationText);
                setInitiatedInviting(false);
              }}
            >
              {_t("chat.send-invite")}
            </Button>
          </div>
        ) : (
          <Button outline={true} size="sm" onClick={() => setInitiatedInviting(true)}>
            {_t("chat.invite")}
          </Button>
        ))}
      {isInvited && (
        <Alert className="my-4" appearance="success">
          {_t("chat.successfully-invited")}
        </Alert>
      )}
    </div>
  );
}
