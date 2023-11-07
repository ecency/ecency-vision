// export function useChatProfilesQuery() {
//   return useMessageListenerQuery<Profile[], ChatQueries[]>(
//     [ChatQueries.PROFILES],
//     MessageEvents.ProfileUpdate,
//     (_, nextData, resolver) => {
//       resolver(nextData);
//     },
//     {
//       initialData: [],
//       queryFn: () => []
//     }
//   );
// }
