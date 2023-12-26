import { Witness, WitnessTransformed } from "@/entities";
import { pathToRegexp } from "path-to-regexp";
import routes from "@/routes";

export function transform(list: Witness[], rankState: number): WitnessTransformed[] {
  return list.map((x, i) => {
    const rank = i + rankState;

    const { props } = x;

    const { total_missed: miss, url } = x;
    const fee = props.account_creation_fee;
    const feed = x.hbd_exchange_rate.base;
    const { maximum_block_size: blockSize } = props;
    const { available_witness_account_subsidies: acAvail } = x;
    const { account_subsidy_budget: acBudget } = props;
    const { running_version: version } = x;
    const { signing_key: signingKey } = x;
    const { last_hbd_exchange_update: priceAge } = x;

    let parsedUrl;
    const oUrl = new URL(url, "https://ecency.com");
    const ex = pathToRegexp(routes.ENTRY).exec(oUrl.pathname);

    if (ex) {
      parsedUrl = {
        category: ex[1],
        author: ex[2].replace("@", ""),
        permlink: ex[3]
      };
    }

    return {
      rank,
      name: x.owner,
      miss,
      fee,
      feed,
      blockSize,
      acAvail: Math.round(acAvail / 10000),
      acBudget,
      version,
      url,
      parsedUrl,
      signingKey,
      priceAge
    };
  });
}
