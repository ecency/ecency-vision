import { FormControl, InputGroup } from "@ui/input";
import { _t } from "../../../i18n";
import accountReputation from "../../../helper/account-reputation";
import React, { useState } from "react";
import UserAvatar from "../../../components/user-avatar";
import useDebounce from "react-use/lib/useDebounce";
import { useSearchUsersQuery } from "../queries";
import { Spinner } from "@ui/spinner";

interface Props {
  setCurrentUser: (v: string) => void;
  setIsCurrentUser: (v: boolean) => void;
}

export function ChatPopupSearchUser({ setCurrentUser, setIsCurrentUser }: Props) {
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useSearchUsersQuery(search);

  useDebounce(() => refetch(), 500, [search]);

  return (
    <>
      <div className="p-4">
        <div className="w-full mb-3">
          <InputGroup prepend={isLoading ? <Spinner className="w-3.5 h-3.5" /> : "@"}>
            <FormControl
              type="text"
              placeholder={_t("chat.search")}
              value={search}
              autoFocus={true}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>
      <div className="user-search-suggestion-list">
        {data.map((user, index) => {
          return (
            <div
              key={index}
              className="search-content"
              onClick={() => {
                setCurrentUser(user.account);
                setIsCurrentUser(true);
              }}
            >
              <div className="search-user-img">
                <span>
                  <UserAvatar username={user.account} size="medium" />
                </span>
              </div>

              <div className="search-user-title">
                <p className="search-username">{user.account}</p>
                <p className="search-reputation">({accountReputation(user.reputation)})</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
