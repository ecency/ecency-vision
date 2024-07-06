"use client";

import useMount from "react-use/lib/useMount";
import { useRouter, useSearchParams } from "next/navigation";
import { validateToken } from "@/utils";
import { hsTokenRenew } from "@/api/auth-api";
import { User } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { getAccount } from "@/api/hive";
import { usrActivity } from "@/api/private-api";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const setActiveUser = useGlobalStore((s) => s.setActiveUser);
  const updateActiveUser = useGlobalStore((s) => s.updateActiveUser);

  useMount(() => {
    const code = searchParams.get("code");
    if (code) {
      if (validateToken(code)) {
        hsTokenRenew(code)
          .then((x) => {
            const user: User = {
              username: x.username,
              accessToken: x.access_token,
              refreshToken: x.refresh_token,
              expiresIn: x.expires_in,
              postingKey: null
            };

            setActiveUser(user.username);
            getAccount(user.username)
              .then((r) => {
                updateActiveUser(r);
                usrActivity(user.username, 20);
              })
              .finally(() => {
                router.push(`/@${user.username}/feed`);
              });
          })
          .catch(() => {
            router.push("/");
          });
      } else {
        router.push("/");
      }
    }
  });

  return <></>;
}
