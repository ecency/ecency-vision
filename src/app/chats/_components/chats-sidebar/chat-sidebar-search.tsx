import { FormControl } from "@ui/input";
import React, { useState } from "react";
import useDebounce from "react-use/lib/useDebounce";
import { useSearchUsersQuery } from "../../_queries";
import { useSearchCommunitiesQuery } from "@/app/chats/_queries/search-communities-query";
import { LinearProgress } from "@/features/shared";
import i18next from "i18next";

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
          placeholder={i18next.t("chat.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {(isLoading || isCommunitiesLoading) && <LinearProgress />}
    </>
  );
}
