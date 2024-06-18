import { PropsWithChildren } from "react";
import { PushNotificationsProvider } from "@/features/push-notifications";
import { ClientProviders } from "@/app/client-providers";
import { EntriesCacheManager } from "@/core/caches";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ClientProviders>
      <PushNotificationsProvider>
        <EntriesCacheManager>{children}</EntriesCacheManager>
      </PushNotificationsProvider>
    </ClientProviders>
  );
}
