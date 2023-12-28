import { useMutation } from "@tanstack/react-query";
import { useGlobalStore } from "@/core/global-store";
import { witnessVote, witnessVoteHot, witnessVoteKc } from "@/api/operations";
import { PrivateKey } from "@hiveio/dhive";

interface KindOfPayload<T extends string> {
  kind: T;
  voted: boolean;
}

interface PayloadApp extends KindOfPayload<"app"> {
  key: PrivateKey;
}

type Payload = KindOfPayload<"hot"> | KindOfPayload<"kc"> | PayloadApp;

export function useVoteWitness(
  witness: string,
  onStart?: () => void,
  onSuccess?: () => void,
  onSettled?: () => void
) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["vote-witness", activeUser?.username, witness],
    mutationFn: async (payload: Payload) => {
      const approve = !payload.voted;

      if (!activeUser) {
        throw new Error("[VoteWitness] – no active user");
      }

      onStart?.();
      switch (payload.kind) {
        case "app":
          return witnessVote(activeUser!!.username, payload.key, witness, approve);
        case "hot":
          return witnessVoteHot(activeUser!!.username, witness, approve);
        case "kc":
          return witnessVoteKc(activeUser!!.username, witness, approve);
        default:
          throw new Error("[VoteWitness] – not known vote kind");
      }
    },
    onSuccess,
    onSettled
  });
}
