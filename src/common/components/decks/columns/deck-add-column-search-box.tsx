import React, { useEffect, useState } from "react";
import { lookupAccounts } from "../../../api/hive";
import { error } from "../../feedback";
import { formatError } from "../../../api/operations";
import { useMappedStore } from "../../../store/use-mapped-store";
import useDebounce from "react-use/lib/useDebounce";
import { Form, InputGroup } from "react-bootstrap";
import { _t } from "../../../i18n";
import { UserAvatar } from "../../user-avatar";

interface Props {
  recentList: string[];
  username: string;
  setUsername: (v: string) => void;
}

export const DeckAddColumnSearchBox = ({ username, setUsername, recentList }: Props) => {
  const { activeUser, global } = useMappedStore();

  const [prefilledUsername, setPrefilledUsername] = useState(username || "");
  const [usernameInput, setUsernameInput] = useState(username || "");
  const [usernameData, setUsernameData] = useState<string[]>([]);
  const [isUsernameDataLoading, setIsUsernameDataLoading] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(false);

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
        const resp = await lookupAccounts(usernameInput, 5);
        if (resp) {
          setUsernameData(resp);
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
            setUsernameInput(e.target.value);
          }}
          onKeyUp={(e: any) => {
            if (e.key === "Enter") {
              setUsername(username);
            }
          }}
        />
      </InputGroup>
      <div className="users-list">
        {usernameData.map((u) => (
          <div className="users-list-item" key={u} onClick={() => setUsername(u)}>
            <UserAvatar size="medium" global={global} username={u} />
            <div>{u}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
