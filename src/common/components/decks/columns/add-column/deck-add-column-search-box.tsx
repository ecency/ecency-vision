import React, { useEffect, useState } from "react";
import { lookupAccounts } from "../../../../api/hive";
import { error } from "../../../feedback";
import { formatError } from "../../../../api/operations";
import { useMappedStore } from "../../../../store/use-mapped-store";
import useDebounce from "react-use/lib/useDebounce";
import { Form, InputGroup } from "react-bootstrap";
import { _t } from "../../../../i18n";
import { UserAvatar } from "../../../user-avatar";
import { getCommunities } from "../../../../api/bridge";
import { UsernameDataItem } from "./common";

interface Props {
  isCommunity?: boolean;
  recentList: UsernameDataItem[];
  username: string;
  setUsername: (v: string) => void;
  setItem?: (i: UsernameDataItem) => void;
}

export const DeckAddColumnSearchBox = ({
  username,
  setUsername,
  recentList,
  isCommunity,
  setItem
}: Props) => {
  const { activeUser, global } = useMappedStore();

  const [prefilledUsername, setPrefilledUsername] = useState(username || "");
  const [usernameInput, setUsernameInput] = useState(username || "");
  const [usernameData, setUsernameData] = useState<UsernameDataItem[]>([]);
  const [isUsernameDataLoading, setIsUsernameDataLoading] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UsernameDataItem | null>(null);

  useDebounce(
    async () => {
      if (!triggerFetch) {
        return;
      }

      if (usernameInput === "" || activeUser?.username === usernameInput) {
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
    if (recentList) {
      setUsernameData(recentList);
    }
  };

  return (
    <div className="deck-add-column-search-box">
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>
            {isUsernameDataLoading ? (
              <div className="spinner-border text-primary spinner-border-sm" role="status">
                <span className="sr-only">{_t("g.loading")}</span>
              </div>
            ) : (
              "@"
            )}
          </InputGroup.Text>
        </InputGroup.Prepend>
        <Form.Control
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
        {usernameData.map((i) => (
          <div
            className="users-list-item"
            key={i.name}
            onClick={() => {
              setUsername(i.name);
              setSelectedItem(i);

              if (setItem) {
                setItem(i);
              }
            }}
          >
            <UserAvatar size="medium" global={global} username={i.tag || i.name} />
            <div className="d-flex flex-column">
              <div className="username">{i.name}</div>
              <div className="description text-truncate">{i.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
