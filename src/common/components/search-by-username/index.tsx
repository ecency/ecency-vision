import { Form, InputGroup } from "react-bootstrap";
import { _t } from "../../i18n";
import SuggestionList from "../suggestion-list";
import React, { useEffect, useState } from "react";
import UserAvatar from "../user-avatar";
import { lookupAccounts } from "../../api/hive";
import { error } from "../feedback";
import { formatError } from "../../api/operations";
import { ActiveUser } from "../../store/active-user/types";
import { Spinner } from "../spinner";

interface Props {
  username?: string;
  setUsername: (value: string) => void;
  activeUser: ActiveUser | null;
  excludeActiveUser?: boolean;
  recent?: string[];
}

export const SearchByUsername = ({
  setUsername,
  activeUser,
  excludeActiveUser,
  recent,
  username
}: Props) => {
  const [prefilledUsername, setPrefilledUsername] = useState(username || "");
  const [usernameInput, setUsernameInput] = useState(username || "");
  const [usernameData, setUsernameData] = useState<string[]>([]);
  const [isActiveUserSet, setIsActiveUserSet] = useState(false);
  const [timer, setTimer] = useState<any>(null);
  const [isUsernameDataLoading, setIsUsernameDataLoading] = useState(false);

  useEffect(() => {
    if (!usernameInput) {
      setUsername("");
      if (recent) {
        setUsernameData(recent);
      }
    }
    if (usernameInput !== prefilledUsername) {
      fetchUsernameData(usernameInput);
      setPrefilledUsername("");
    }
  }, [usernameInput]);

  useEffect(() => {
    if (activeUser && !excludeActiveUser) {
      setIsActiveUserSet(true);
      setUsername(activeUser.username);
      setUsernameInput(activeUser.username);
    }
  }, [activeUser]);

  const fetchUsernameData = (query: string) => {
    if (timer) {
      clearTimeout(timer);
    }

    if (usernameInput === "" || isActiveUserSet) {
      setIsActiveUserSet(false);
      setIsUsernameDataLoading(false);
      return;
    }

    setIsUsernameDataLoading(true);
    setTimer(setTimeout(() => getUsernameData(query), 500));
  };

  const getUsernameData = async (query: string) => {
    try {
      const resp = await lookupAccounts(query, 5);
      if (resp) {
        setUsernameData(
          resp.filter((item) => (excludeActiveUser ? item !== activeUser?.username : true))
        );
      }
    } catch (e) {
      error(...formatError(e));
    } finally {
      setIsUsernameDataLoading(false);
    }
  };

  const suggestionProps = {
    renderer: (i: any) => {
      return (
        <>
          <UserAvatar username={i.username || i} size="medium" />{" "}
          <span style={{ marginLeft: "4px" }}>{i}</span>
        </>
      );
    },
    onSelect: (selectedText: any) => {
      setUsernameInput(selectedText);
      setUsername(selectedText);
    }
  };

  return (
    <SuggestionList
      items={usernameData}
      {...suggestionProps}
      header={!usernameInput ? _t("transfer.recent-transfers") : ""}
    >
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>{isUsernameDataLoading ? <Spinner /> : "@"}</InputGroup.Text>
        </InputGroup.Prepend>
        <Form.Control
          type="text"
          autoFocus={true}
          placeholder=""
          value={usernameInput}
          onChange={(e) => {
            setUsernameInput(e.target.value);
            setUsername(e.target.value);
          }}
        />
      </InputGroup>
    </SuggestionList>
  );
};
