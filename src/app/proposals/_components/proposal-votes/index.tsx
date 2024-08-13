import React, { useMemo, useState } from "react";
import numeral from "numeral";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { List, ListItem } from "@ui/list";
import { Badge } from "@ui/badge";
import i18next from "i18next";
import { Proposal } from "@/entities";
import { LinearProgress, ProfileLink, UserAvatar } from "@/features/shared";
import { accountReputation, parseAsset } from "@/utils";
import { getAccountsQuery, getDynamicPropsQuery, getProposalVotesQuery } from "@/api/queries";

type SortOption = "reputation" | "hp";

interface ProposalVotesProps {
  proposal: Proposal;
  onHide: () => void;
}

export function ProposalVotes({ proposal, onHide }: ProposalVotesProps) {
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState<SortOption>("hp");

  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();
  const { data: votes, isLoading } = getProposalVotesQuery(
    proposal.proposal_id,
    "",
    1000
  ).useClientQuery();

  const usernames = useMemo(() => Array.from(new Set(votes?.map((x) => x.voter))), [votes]);
  const { data: accounts } = getAccountsQuery(usernames).useClientQuery();
  const voters = useMemo(
    () =>
      accounts
        ?.map((account) => {
          const hp =
            (parseAsset(account.vesting_shares).amount * dynamicProps!.hivePerMVests) / 1e6;

          let vsfVotes = 0;
          account.proxied_vsf_votes.forEach((x: string | number) => (vsfVotes += Number(x)));

          const proxyHp = (vsfVotes * dynamicProps!.hivePerMVests) / 1e12;
          const totalHp = hp + proxyHp;

          return {
            name: account.name,
            reputation: account.reputation!,
            hp,
            proxyHp,
            totalHp
          };
        })
        ?.filter((item) => item.name.toLowerCase().includes(searchText.toLocaleLowerCase()))
        .sort((a, b) => {
          if (sort === "reputation") {
            return b.reputation > a.reputation ? 1 : -1;
          }
          return b.totalHp > a.totalHp ? 1 : -1;
        }),
    [accounts, dynamicProps, searchText, sort]
  );

  return (
    <Modal onHide={onHide} show={true} centered={true} size="lg" className="proposal-votes-dialog">
      <ModalHeader closeButton={true} className="items-center">
        <ModalTitle>
          {accounts?.length + " " + i18next.t("proposals.votes-dialog-title", { n: proposal.id })}
        </ModalTitle>
      </ModalHeader>
      <div className="w-full flex flex-col sm:flex-row gap-4 p-3 mb-3">
        <FormControl
          type="text"
          placeholder={i18next.t("proposals.search-placeholder")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <FormControl
          type="select"
          onChange={(e: any) => setSort(e.target.value as SortOption)}
          value={sort}
        >
          <option value="reputation">{i18next.t("proposals.sort-reputation")}</option>
          <option value="hp">{i18next.t("proposals.sort-hp")}</option>
        </FormControl>
      </div>
      <ModalBody>
        {isLoading && <LinearProgress />}

        <div className="voters-list mb-4">
          <List grid={true} inline={true} defer={true}>
            {(voters?.length ?? 0) > 0 ? (
              voters?.map((x) => {
                const strHp = numeral(x.hp).format("0.00,");
                const strProxyHp = numeral(x.proxyHp).format("0.00,");

                return (
                  <ListItem styledDefer={true} className="!flex gap-3" key={x.name}>
                    <ProfileLink username={x.name}>
                      <UserAvatar username={x.name} size="small" />
                    </ProfileLink>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <ProfileLink username={x.name}>
                          <span className="item-name notranslate">{x.name}</span>
                        </ProfileLink>
                        <Badge className="text-xs leading-3">
                          {accountReputation(x.reputation)}
                        </Badge>
                      </div>
                      <div className="item-extra">
                        <span>{`${strHp} HP`}</span>
                        {x.proxyHp > 0 && (
                          <>
                            {" + "}
                            <span>
                              {`${strProxyHp} HP`}
                              {" (proxy) "}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </ListItem>
                );
              })
            ) : (
              <div className="user-info">
                {isLoading ? i18next.t("proposals.searching") : i18next.t("proposals.no-results")}
              </div>
            )}
          </List>
        </div>
      </ModalBody>
    </Modal>
  );
}
