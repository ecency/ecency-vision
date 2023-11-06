import { useMutation } from "@tanstack/react-query";
import { useNostrPublishMutation } from "../nostr/nostr-publish-mutation";
import { Kind } from "../../../../lib/nostr-tools/event";
import { Community } from "../../../store/communities";
import { useNostrJoinedCommunityTeamQuery } from "../queries";
import { getAccountFull } from "../../../api/hive";
import { updateProfile } from "../../../api/operations";

/**
 * A custom React Query hook for creating a chat channel within a community.
 * This hook allows you to create a chat channel associated with a specific community.
 */
export function useCreateCommunityChat(community: Community) {
  const { data: communityTeam } = useNostrJoinedCommunityTeamQuery(community);
  const { mutateAsync: createChannel } = useNostrPublishMutation(
    ["chats/create-channel"],
    Kind.ChannelCreation,
    () => {},
    {}
  );

  return useMutation(["chats/create-community-chat"], async () => {
    // Step 1: Create a chat channel using the `createChannel` mutation.
    const data = await createChannel({
      eventMetadata: {
        name: community.title,
        about: community.description,
        communityName: community.name,
        picture: "",
        communityModerators: communityTeam,
        hiddenMessageIds: [],
        removedUserIds: []
      },
      tags: []
    });

    // Step 2: Extract and format channel metadata from the response.
    const content = JSON.parse(data?.content!);
    const channelMetaData = {
      id: data?.id as string,
      creator: data?.pubkey as string,
      created: data?.created_at!,
      communityName: content.communityName,
      name: content.name,
      about: content.about,
      picture: content.picture
    };

    // Step 3: Retrieve the user's profile information.
    const response = await getAccountFull(community.name!);
    const { posting_json_metadata } = response;

    // Step 4: Update the user's profile with the new channel information.
    const profile = JSON.parse(posting_json_metadata!).profile;
    const newProfile = {
      channel: channelMetaData
    };

    return await updateProfile(response, { ...profile, ...newProfile });
  });
}
