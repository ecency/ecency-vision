"use client";

import { error, Feedback, Navbar, Theme } from "@/features/shared";
import { Button } from "@ui/button";
import i18next from "i18next";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";
import { useGlobalStore } from "@/core/global-store";
import { useState } from "react";
import { User } from "@/entities";
import { hsTokenRenew } from "@/api/auth-api";
import { formatError, setUserRole, updateCommunity } from "@/api/operations";

export default function CommunityCreateHsPage() {
  const router = useRouter();
  const params = useSearchParams();

  const activeUser = useGlobalStore((s) => s.activeUser);
  const addUser = useGlobalStore((s) => s.addUser);

  const [_, setUsername] = useState("");
  const [inProgress, setInProgress] = useState(true);
  const [progress, setProgress] = useState("");
  const [done, setDone] = useState(false);

  const handle = async () => {
    const code = params.get("code");
    const title = params.get("title") ?? "";
    const about = params.get("about") ?? "";

    if (!code || !activeUser) {
      router.push("/");
      return;
    }

    setInProgress(true);
    setProgress(i18next.t("communities-create.progress-user"));

    // get access token from code and create user object
    let user: User;
    try {
      user = await hsTokenRenew(code).then((x) => ({
        username: x.username,
        accessToken: x.access_token,
        refreshToken: x.refresh_token,
        expiresIn: x.expires_in,
        postingKey: null
      }));
    } catch (e) {
      error(...formatError(e));
      setInProgress(false);
      setProgress("");
      return;
    }

    // add username to state
    setUsername(user.username);

    // add community user to reducer
    addUser(user);

    // set admin role
    setProgress(i18next.t("communities-create.progress-role", { u: activeUser.username }));

    try {
      await setUserRole(user.username, user.username, activeUser.username, "admin");
    } catch (e) {
      error(...formatError(e));
      setInProgress(false);
      setProgress("");
      return;
    }

    // update community props
    setProgress(i18next.t("communities-create.progress-props"));

    try {
      await updateCommunity(user.username, user.username, {
        title,
        about,
        lang: "en",
        description: "",
        flag_text: "",
        is_nsfw: false
      });
    } catch (e) {
      error(...formatError(e));
      setInProgress(false);
      setProgress("");
      return;
    }

    // wait 3 seconds to hivemind synchronize community data
    await new Promise((r) => {
      setTimeout(() => {
        r(true);
      }, 3000);
    });

    // done
    setInProgress(false);
    setDone(true);

    // redirect to community page
    router.push(`/created/${user.username}`);
  };

  return (
    <>
      <Head>
        <title>{i18next.t("communities-create.page-title")}</title>
        <meta name="description" content={i18next.t("communities-create.description")} />
      </Head>
      <Theme />
      <Feedback />
      <Navbar />

      <div className="app-content communities-page">
        <div className="community-form">
          <h1 className="form-title">{i18next.t("communities-create.page-title")}</h1>
          {inProgress && <p>{progress}</p>}
          {done && <></>}
          {!inProgress && !done && (
            <div>
              <p className="text-red">{i18next.t("g.server-error")}</p>
              <p>
                <Button onClick={() => handle()}>{i18next.t("g.try-again")}</Button>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
