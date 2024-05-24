import { PropsWithChildren } from "react";
import { PushNotificationsProvider } from "@/features/push-notifications";
import { ClientProviders } from "@/app/client-providers";
import { ClientInit } from "@/app/client-init";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ClientProviders>
      <ClientInit />
      <PushNotificationsProvider>{children}</PushNotificationsProvider>
    </ClientProviders>
  );
}
