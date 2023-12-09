import React, { ReactElement, useEffect, useState } from "react";

import { makePath as makePathTag } from "../tag";
import { makePath as makePathProfile } from "../profile-link";
import defaults from "@/defaults.json";
import { Community, Reputations } from "@/entities";
import { usePathname, useRouter } from "next/navigation";
import { useDebounce, usePrevious } from "react-use";
import { useTrendingTagsQuery } from "@/api/queries";
import i18next from "i18next";
import { getAccountReputations } from "@/api/hive";
import { UserAvatar } from "@/features/shared";
import { accountReputation } from "@/utils";
import { dataLimit, getCommunities } from "@/api/bridge";
import { SuggestionList } from "../suggestion-list";

interface Props {
  value: string;
  children: ReactElement;
  containerClassName?: string;
  changed: boolean;
}

export function SearchSuggester({ changed, value, children, containerClassName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const previousPathname = usePrevious(pathname);
  const previousValue = usePrevious(value);

  const [suggestions, setSuggestions] = useState<string[] | Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("");
  const [suggestionWithMode, setSuggestionWithMode] = useState<any[]>([]);

  const { data: trendingTags } = useTrendingTagsQuery();

  useEffect(() => {
    if (previousPathname !== pathname) {
      setSuggestions([]);
      setLoading(false);
      setMode("");
    }
  }, [pathname, previousPathname]);

  useDebounce(
    () => {
      if (value !== previousValue && changed) {
      }
    },
    1000,
    [value, previousValue]
  );

  useEffect(() => {
    if (value !== previousValue && changed) {
      fetch();
    }
  }, [value, previousValue]);

  const fetch = async () => {
    if (loading) {
      return;
    }

    // # Tags
    if (value.startsWith("#")) {
      const tag = value.replace("#", "");
      const suggestions = trendingTags
        .filter((x: string) => x.toLowerCase().indexOf(tag.toLowerCase()) === 0)
        .filter((x: string) => x.indexOf("hive-") === -1)
        .map((x) => `#${x}`)
        .slice(0, 20);

      const suggestionWithMode = [
        {
          header: i18next.t("search.header-tag"),
          onSelect: (i: string) => {
            tagSelected(i.replace("#", ""));
          },
          items: suggestions
        }
      ];
      setMode("tag");
      setSuggestions(suggestions);
      setSuggestionWithMode(suggestionWithMode);
      return;
    }

    // Account
    if (value.startsWith("@")) {
      const name = value.replace("@", "");
      setLoading(true);
      try {
        const r = await getAccountReputations(name, 20);
        r.sort((a, b) => (a.reputation > b.reputation ? -1 : 1));
        const suggestions = r.map((x) => `${x.account}`);
        const suggestionWithMode = [
          {
            header: i18next.t("search.header-account"),
            renderer: (i: Reputations) => {
              return (
                <>
                  <UserAvatar username={i.account} size="medium" />
                  <span style={{ marginLeft: "8px" }}>{i.account}</span>
                  <span style={{ marginLeft: "8px" }}>({accountReputation(i.reputation)})</span>
                </>
              );
            },
            onSelect: (i: Reputations) => accountSelected(i.account),
            items: r
          }
        ];
        setMode("account");
        setSuggestions(suggestions);
        setSuggestionWithMode(suggestionWithMode);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Community
    if (value.startsWith("$")) {
      const q = value.replace("$", "");
      try {
        const r = await getCommunities("", dataLimit, q);
        if (r) {
          const suggestionWithMode = [
            {
              header: i18next.t("search.header-community"),
              renderer: (i: Community) => i.title,
              onSelect: (i: Community) => communitySelected(i),
              items: r
            }
          ];
          setMode("comm");
          setSuggestions(r);
          setSuggestionWithMode(suggestionWithMode);
        }
      } catch (e) {
        setLoading(false);
      }
      return;
    }

    // Search ALL
    if (!!value) {
      try {
        // tags
        const tags_suggestions = trendingTags
          .filter((x: string) => x.toLowerCase().indexOf(value.toLowerCase()) === 0)
          .filter((x: string) => x.indexOf("hive-") === -1)
          .map((x) => `#${x}`)
          .slice(0, 2);
        // account
        const lookup_accounts = await getAccountReputations(value, 20);
        const accountsug = lookup_accounts
          .sort((a, b) => (a.reputation > b.reputation ? -1 : 1))
          .slice(0, 3);
        // Community
        const get_communities = await getCommunities("", 2, value);
        const communities_suggestions = get_communities || [];
        const suggestionWithMode = [
          {
            header: i18next.t("search.header-tag"),
            onSelect: (i: string) => tagSelected(i.replace("#", "")),
            items: tags_suggestions
          },
          {
            header: i18next.t("search.header-account"),
            renderer: (i: Reputations) => {
              return (
                <>
                  <UserAvatar username={i.account} size="medium" />
                  <span style={{ marginLeft: "8px" }}>{i.account}</span>
                  <span style={{ marginLeft: "8px" }}>({accountReputation(i.reputation)})</span>
                </>
              );
            },
            onSelect: (i: Reputations) => accountSelected(i.account),
            items: accountsug
          },
          {
            header: i18next.t("search.header-community"),
            renderer: (i: Community) => {
              return i.title;
            },
            onSelect: (i: Community) => communitySelected(i),
            items: communities_suggestions
          }
        ];
        setMode("all");
        setSuggestions([]);
        setSuggestionWithMode(suggestionWithMode);
      } finally {
        setLoading(false);
      }
    } else {
      setMode("");
      setSuggestionWithMode([]);
      setSuggestions([]);
    }
  };

  const accountSelected = (name: string) => {
    const loc = makePathProfile(name);
    router.push(loc);
  };

  const tagSelected = (tag: string) => {
    const loc = makePathTag(defaults.filter, tag);
    router.push(loc);
  };

  const communitySelected = (item: Community) => {
    const loc = makePathTag(defaults.filter, item.name);
    router.push(loc);
  };

  return (
    <SuggestionList
      searchValue={value}
      items={suggestions}
      modeItems={suggestionWithMode}
      containerClassName={containerClassName}
    >
      {children}
    </SuggestionList>
  );
}
