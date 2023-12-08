import React, { useRef } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { useGlobalStore } from "@/core/global-store";
import { useUnmount } from "react-use";
import { LoginKc } from "./login-kc";
import { Login } from "./login";
import { Account, User } from "@/entities";
import { hsTokenRenew } from "@/api/auth-api";
import { usrActivity } from "@/api/private-api";
import { useRouter } from "next/router";

export function LoginDialog() {
  const userListRef = useRef();

  const router = useRouter();

  const usePrivate = useGlobalStore((state) => state.usePrivate);
  const loginKc = useGlobalStore((state) => state.loginKc);
  const toggleUIProp = useGlobalStore((state) => state.toggleUiProp);
  const addUser = useGlobalStore((state) => state.addUser);
  const setActiveUser = useGlobalStore((state) => state.setActiveUser);
  const updateActiveUser = useGlobalStore((state) => state.updateActiveUser);

  useUnmount(() => {
    if (loginKc) {
      toggleUIProp("loginKc");
    }
  });

  const doLogin = async (
    hsCode: string,
    postingKey: null | undefined | string,
    account: Account
  ) => {
    // get access token from code
    return hsTokenRenew(hsCode).then((x) => {
      const user: User = {
        username: x.username,
        accessToken: x.access_token,
        refreshToken: x.refresh_token,
        expiresIn: x.expires_in,
        postingKey
      };

      // add / update user data
      addUser(user);

      // activate user
      setActiveUser(user.username);

      // add account data of the user to the reducer
      updateActiveUser(account);

      if (usePrivate) {
        // login activity
        usrActivity(user.username, 20);
      }

      // redirection based on path name
      if (router.pathname.startsWith("/signup")) {
        const u = `/@${x.username}/feed`;
        router.push(u);
      }
    });
  };

  const hide = () => toggleUIProp("login");

  return (
    <Modal show={true} centered={true} onHide={hide} className="login-modal" animation={false}>
      <ModalHeader thin={true} closeButton={true} />
      <ModalBody>
        {!loginKc && (
          // eslint-disable-next-line react/jsx-no-undef
          <Login doLogin={doLogin} userListRef={userListRef} />
        )}
        {loginKc && <LoginKc doLogin={doLogin} />}
      </ModalBody>
    </Modal>
  );
}
