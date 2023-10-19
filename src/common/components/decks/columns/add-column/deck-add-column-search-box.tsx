import React, { useEffect, useState } from "react";
import { lookupAccounts } from "../../../../api/hive";
import { error } from "../../../feedback";
import { formatError } from "../../../../api/operations";
import { useMappedStore } from "../../../../store/use-mapped-store";
import useDebounce from "react-use/lib/useDebounce";
import { UserAvatar } from "../../../user-avatar";
import { getCommunities } from "../../../../api/bridge";
import { UsernameDataItem } from "./common";
import { closeSvg } from "../../../../img/svg";
import { FormControl, InputGroup } from "@ui/input";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";

interface Props {
  isCommunity?: boolean;
  recentList: UsernameDataItem[] | undefined;
  setRecentList: (l: UsernameDataItem[]) => void;
  username: string;
  setUsername: (v: string) => void;
  setItem?: (i: UsernameDataItem) => void;
}

export const DeckAddColumnSearchBox = ({
  username,
  setUsername,
  recentList,
  isCommunity,
  setItem,
  setRecentList
}: Props) => {
  const { activeUser, global } = useMappedStore();

  const [prefilledUsername, setPrefilledUsername] = useState(username || "");
  const [usernameInput, setUsernameInput] = useState(username || "");
  const [usernameData, setUsernameData] = useState<UsernameDataItem[]>([]);
  const [isUsernameDataLoading, setIsUsernameDataLoading] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [isRecent, setIsRecent] = useState(true);

  useDebounce(
    async () => {
      if (!triggerFetch) {
        return;
      }

      if (usernameInput === "") {
        setIsUsernameDataLoading(false);
        return;
      }

      setIsUsernameDataLoading(true);

      try {
        let data: UsernameDataItem[];

        if (isCommunity) {
          const communitiesResponse = await getCommunities("", 4, usernameInput, "rank");
          data =
            communitiesResponse?.map(({ title, about, name }) => ({
              name: title,
              description: about,
              tag: name
            })) ?? [];
        } else {
          const usersResponse = await lookupAccounts(usernameInput, 5);
          data = usersResponse.map((u) => ({ name: u }));
        }

        if (data) {
          setUsernameData(data);
          setIsRecent(false);
        }
      } catch (e) {
        error(...formatError(e));
      } finally {
        setIsUsernameDataLoading(false);
        setTriggerFetch(false);
      }
    },
    500,
    [usernameInput]
  );

  useEffect(() => {
    if (!usernameInput) {
      resetToRecentList();
    }
    if (usernameInput !== prefilledUsername) {
      setTriggerFetch(true);
      setPrefilledUsername("");
    }
  }, [usernameInput]);

  const resetToRecentList = () => {
    setUsername("");
    setIsRecent(true);
    if (recentList) {
      setUsernameData(recentList);
    }
  };

  return (
    <div className="deck-add-column-search-box">
      <InputGroup prepend={isUsernameDataLoading ? <Spinner /> : "@"}>
        <FormControl
          type="text"
          autoFocus={true}
          placeholder=""
          value={usernameInput}
          onChange={(e) => {
            setUsernameInput(e.target.value.toLowerCase());
          }}
        />
      </InputGroup>
      <div className="users-list">
        {isRecent && !!recentList?.length && <div className="recent-label">Recent</div>}
        {usernameData.map((i) => (
          <div
            className="users-list-item"
            key={i.name}
            onClick={() => {
              setUsername(i.name);
              setRecentList([
                ...(recentList ?? []),
                ...(recentList?.some((it) => it.name === i.name) ? [] : [i])
              ]);

              if (setItem) {
                setItem(i);
              }
            }}
          >
            <UserAvatar size="medium" global={global} username={i.tag || i.name} />
            <div className="flex w-full flex-col">
              <div className="username">{i.name}</div>
              <div className="description">{i.description}</div>
            </div>
            {isRecent && !!recentList?.length && (
              <Button
                appearance="link"
                onClick={(e: { stopPropagation: () => void }) => {
                  e.stopPropagation();
                  const nextData = recentList?.filter((it) => it.name !== i.name) ?? [];
                  setRecentList(nextData);
                  setUsernameData(nextData);
                }}
              >
                {closeSvg}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
