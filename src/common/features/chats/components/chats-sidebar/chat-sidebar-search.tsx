import { FormControl } from "@ui/input";
import { _t } from "../../../../i18n";
import React, { useState } from "react";
import useDebounce from "react-use/lib/useDebounce";
import { getAccountReputations } from "../../../../api/hive";
import { AccountWithReputation } from "../../types";
import LinearProgress from "../../../../components/linear-progress";

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  setUserList: (v: AccountWithReputation[]) => void;
}

export function ChatSidebarSearch({ setUserList, searchQuery, setSearchQuery }: Props) {
  const [searchInProgress, setSearchInProgress] = useState(false);

  useDebounce(
    async () => {
      if (searchQuery.length !== 0) {
        const resp = await getAccountReputations(searchQuery, 30);
        const sortedByReputation = resp.sort((a, b) => (a.reputation > b.reputation ? -1 : 1));
        setUserList(sortedByReputation);
        setSearchInProgress(false);
      }
    },
    500,
    [searchQuery]
  );

  return (
    <>
      <div className="bg-gray-100 dark:bg-dark-200 p-3 border-b border-[--border-color]">
        <FormControl
          type="text"
          placeholder={_t("chat.search")}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSearchInProgress(true);
            if (e.target.value.length === 0) {
              setSearchInProgress(false);
              setUserList([]);
            }
          }}
        />
      </div>
      {searchInProgress && <LinearProgress />}
    </>
  );
}
