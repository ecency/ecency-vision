import { PropsWithChildren } from "react";
import { PushNotificationsProvider } from "@/features/push-notifications";
import { ClientProviders } from "@/app/client-providers";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ClientProviders>
      <PushNotificationsProvider>{children}</PushNotificationsProvider>
    </ClientProviders>
  );
}
