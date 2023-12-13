import { FormControl } from "@ui/input";
import { _t } from "../../../../i18n";
import React, { useState } from "react";
import useDebounce from "react-use/lib/useDebounce";
import LinearProgress from "../../../../components/linear-progress";
import { useSearchUsersQuery } from "../../queries";
import { useSearchCommunitiesQuery } from "../../queries/search-communities-query";

interface Props {
  setSearch: (v: string) => void;
}

export function ChatSidebarSearch({ setSearch: emitSearch }: Props) {
  const [search, setSearch] = useState("");
  const { isLoading, refetch } = useSearchUsersQuery(search);
  const { isLoading: isCommunitiesLoading, refetch: refetchCommunities } =
    useSearchCommunitiesQuery(search);

  useDebounce(
    async () => {
      await Promise.all([refetch(), refetchCommunities()]);
      emitSearch(search);
    },
    500,
    [search]
  );

  return (
    <>
      <div className="bg-gray-100 dark:bg-dark-200 p-3 border-b border-[--border-color]">
        <FormControl
          type="text"
          placeholder={_t("chat.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {(isLoading || isCommunitiesLoading) && <LinearProgress />}
    </>
  );
}
