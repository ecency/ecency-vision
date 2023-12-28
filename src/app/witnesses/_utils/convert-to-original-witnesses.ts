import { FullAccount, WitnessTransformed } from "@/entities";

export function convertToOriginalWitnesses(
  data: WitnessTransformed[],
  accounts: FullAccount[]
): WitnessTransformed[] {
  return data.map((i) => {
    try {
      const account = accounts.find((acc) => acc.name === i.name);
      if (account) {
        const parsedArray = JSON.parse(
          account.posting_json_metadata ? account.posting_json_metadata : ""
        );
        return {
          ...i,
          witnessBy: parsedArray.profile.witness_owner
            ? parsedArray.profile.witness_owner
            : undefined
        };
      }
      return i;
    } catch (e) {
      return i;
    }
  });
}
