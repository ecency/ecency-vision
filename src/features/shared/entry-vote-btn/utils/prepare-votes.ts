import { parseAsset, parseDate } from "@/utils";
import { Entry, Vote } from "@/entities";

export function prepareVotes(entry: Entry, votes: Vote[]): Vote[] {
  // const totalPayout =
  //     parseAsset(entry.pending_payout_value).amount +
  //     parseAsset(entry.author_payout_value).amount +
  //     parseAsset(entry.curator_payout_value).amount;

  let totalPayout = 0;

  const { pending_payout_value, author_payout_value, curator_payout_value, payout } = entry;

  if (pending_payout_value && author_payout_value && curator_payout_value) {
    totalPayout =
      parseAsset(entry.pending_payout_value).amount +
      parseAsset(entry.author_payout_value).amount +
      parseAsset(entry.curator_payout_value).amount;
  }

  if (payout && Number(totalPayout.toFixed(3)) !== payout) {
    totalPayout += payout;
  }
  const voteRshares = votes && votes.reduce((a, b) => a + parseFloat(b.rshares), 0);
  const ratio = totalPayout / voteRshares;

  return votes.map((a) => {
    const rew = parseFloat(a.rshares) * ratio;

    return Object.assign({}, a, {
      reward: rew,
      timestamp: parseDate(a.time).getTime(),
      percent: a.percent / 100
    });
  });
}
