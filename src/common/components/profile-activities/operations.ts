import { utils } from "@hiveio/dhive";
import { getAccountHistory } from "../../api/hive";
import { ActivitiesGroup } from "./types/activities-group";

const ops = utils.operationOrders;

export const ACCOUNT_ACTIVITY_GROUPS: Record<ActivitiesGroup, number[]>  = {
    comment: [
      ops.comment
    ],
    proposalPay: [
        ops.proposal_pay
      ],
      vote: [
        ops.vote
      ],
      customJson: [
        ops.custom_json,
      ],
      witnessVote: [
        ops.account_witness_vote
      ],
      proposalVote: [
        ops.update_proposal_votes
      ],
      update: [
        ops.account_update2
      ]
  };

  const ALL_ACCOUNT_OPERATIONS = [...Object.values(ACCOUNT_ACTIVITY_GROUPS)].reduce(
    (acc, val) => acc.concat(val),
    []
  );

  export const fetchActvities = (username: string, group: ActivitiesGroup | "" = "", start: number = -1, limit: number = 20) =>  {

    const name = username.replace("@", "");

    let filters: ActivitiesGroup[] | "" = [];
    switch (group) {
      case "comment":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["comment"]);
        break;
      case "proposalPay":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["proposalPay"]);
        break;
      case "vote":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["vote"]);
        break;
      case "customJson":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["customJson"]);
        break;
      case "witnessVote":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["witnessVote"]);
        break;
      case "proposalVote":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["proposalVote"]);
        break;
      case "update":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["update"]);
        break;
      default:
        filters = utils.makeBitMaskFilter(ALL_ACCOUNT_OPERATIONS);
    }

    const res = getAccountHistory(name, filters, start, limit)
      .then((r) => {
        const mapped: any = r.map((x: any) => {
          const { op } = x[1];
          const { timestamp, trx_id } = x[1];
          const opName = op[0];
          const opData = op[1];

          return {
            num: x[0],
            type: opName,
            timestamp,
            trx_id,
            ...opData
          };
        });

            const activities = mapped
          .filter((x: any) => x !== null)
          .sort((a: any, b: any) => b.num - a.num);
          
          return activities
          
        })
        .catch((err) => {
            console.log("catch", err);
        });
    return res
  };