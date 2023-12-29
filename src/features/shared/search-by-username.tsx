import React, { useEffect, useState } from "react";
import { FormControl, InputGroup } from "@ui/input";
import { Spinner } from "@ui/spinner";
import { useGlobalStore } from "@/core/global-store";
import { lookupAccounts } from "@/api/hive";
import { formatError } from "@/api/operations";
import { error } from "@/features/shared/feedback";
import { UserAvatar } from "@/features/shared/user-avatar";
import { SuggestionList } from "@/features/shared/suggestion-list";
import i18next from "i18next";

interface Props {
  username?: string;
  setUsername: (value: string) => void;
  excludeActiveUser?: boolean;
  recent?: string[];
}

export const SearchByUsername = ({ setUsername, excludeActiveUser, recent, username }: Props) => {
  const activeUser = useGlobalStore((state) => state.activeUser);

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
      header={!usernameInput ? i18next.t("transfer.recent-transfers") : ""}
    >
      <InputGroup prepend={isUsernameDataLoading ? <Spinner /> : "@"}>
        <FormControl
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
