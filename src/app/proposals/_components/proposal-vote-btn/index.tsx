import React, { useMemo } from "react";
import "./_index.scss";
import { useGlobalStore } from "@/core/global-store";
import { chevronUpSvg } from "@ui/svg";
import { KeyOrHotDialog, LoginRequired } from "@/features/shared";
import { useProposalVoteByKey, useProposalVoteByKeychain } from "@/api/mutations/proposal-vote";
import { proposalVoteHot } from "@/api/operations";
import { getProposalVotesQuery } from "@/api/queries";

interface Props {
  proposal: number;
}

export function ProposalVoteBtn({ proposal }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data, isLoading } = getProposalVotesQuery(
    proposal,
    activeUser?.username ?? "",
    1
  ).useClientQuery();
  const voted = useMemo(
    () => (data?.length ?? 0) > 0 && data?.[0].voter === activeUser?.username,
    [activeUser?.username, data]
  );

  const { mutateAsync: voteByKey, isPending: isVotingByKey } = useProposalVoteByKey(proposal);
  const { mutateAsync: voteByKeychain, isPending: isVotingByKeychain } =
    useProposalVoteByKeychain(proposal);

  const cls = `btn-proposal-vote btn-up-vote vote-btn-lg ${
    isVotingByKey || isVotingByKeychain || isLoading ? "in-progress" : ""
  } ${voted ? "voted" : ""}`;

  if (!activeUser) {
    return (
      <LoginRequired>
        <div className="proposal-vote-btn">
          <div className={cls}>
            <span className="btn-inner">{chevronUpSvg}</span>
          </div>
        </div>
      </LoginRequired>
    );
  }

  return (
    <KeyOrHotDialog
      onKey={(key) => voteByKey({ key })}
      onKc={() => voteByKeychain({})}
      onHot={() => proposalVoteHot(activeUser?.username, proposal, false)}
    >
      <div className="proposal-vote-btn">
        <div className={cls}>
          <span className="btn-inner">{chevronUpSvg}</span>
        </div>
      </div>
    </KeyOrHotDialog>
  );
}
