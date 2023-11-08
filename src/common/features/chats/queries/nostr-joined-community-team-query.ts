import { useQuery } from "@tanstack/react-query";
import { ChatQueries } from "./queries";
import { CommunityModerator } from "../managers/message-manager-types";
import { getProfileMetaData } from "../utils";
import { Community, ROLES } from "../../../store/communities";
import { NOSTRKEY } from "../components/chat-popup/chat-constants";
import { useMappedStore } from "../../../store/use-mapped-store";
import { useKeysQuery } from "./keys-query";

/**
 * Get a community team members which joined to Nostr and available to create a chat
 */
export function useNostrJoinedCommunityTeamQuery(community: Community) {
  const { activeUser } = useMappedStore();

  const { hasKeys, publicKey } = useKeysQuery();

  return useQuery(
    [ChatQueries.COMMUNITY_ROLES, community.name],
    async () => {
      let communityTeam: CommunityModerator[] = [];
      const ownerData = await getProfileMetaData(community.name);

      communityTeam.push({
        name: activeUser!.username,
        pubkey: publicKey || ownerData.nsKey,
        role: "owner"
      });

      for (const [name, role] of community.team) {
        if ([ROLES.ADMIN, ROLES.MOD].includes(role as ROLES)) {
          const profileData = await getProfileMetaData(name);
          if (profileData && profileData.hasOwnProperty(NOSTRKEY)) {
            const roleInfo: CommunityModerator = {
              name,
              pubkey: profileData.nsKey,
              role
            };

            communityTeam.push(roleInfo);
          }
        }
      }

      return communityTeam;
    },
    {
      initialData: [],
      enabled: hasKeys && activeUser?.username === community.name
    }
  );
}
