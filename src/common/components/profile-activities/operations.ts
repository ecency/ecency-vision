import { utils } from "@hiveio/dhive";
import { getAccountHistory } from "../../api/hive";
import { ActivitiesGroup } from "./types/activities-group";

const ops = utils.operationOrders;

export const ACCOUNT_ACTIVITY_GROUPS: Record<ActivitiesGroup, number[]>  = {
    comment: [
      ops.comment
    ],
    proposal_pay: [
        ops.proposal_pay
      ],
      vote: [
        ops.vote
      ],
      custom_json: [
        ops.custom_json,
      ],
      account_witness_vote: [
        ops.account_witness_vote
      ],
      update_proposal_votes: [
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
      case "proposal_pay":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["proposal_pay"]);
        break;
      case "vote":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["vote"]);
        break;
      case "custom_json":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["custom_json"]);
        break;
      case "account_witness_vote":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["account_witness_vote"]);
        break;
      case "update_proposal_votes":
        filters = utils.makeBitMaskFilter(ACCOUNT_ACTIVITY_GROUPS["update_proposal_votes"]);
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