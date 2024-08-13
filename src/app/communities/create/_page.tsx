"use client";

import numeral from "numeral";
import base58 from "bs58";
import { AccountCreateOperation, Authority, cryptoUtils, PrivateKey } from "@hiveio/dhive";
import hs from "hivesigner";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl, InputGroupCopyClipboard } from "@ui/input";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { error, Feedback, KeyOrHot, LoginRequired, Navbar, Theme } from "@/features/shared";
import i18next from "i18next";
import { alertCircleSvg, checkSvg, informationVariantSvg } from "@ui/svg";
import Link from "next/link";
import { Tooltip } from "@ui/tooltip";
import { useGlobalStore } from "@/core/global-store";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { handleInvalid, handleOnInput, makeHsCode, parseAsset, random } from "@/utils";
import useMount from "react-use/lib/useMount";
import { client, getAccount } from "@/api/hive";
import { formatError, setUserRole, updateCommunity } from "@/api/operations";
import * as keychain from "@/utils/keychain";
import { User } from "@/entities";
import { hsTokenRenew } from "@/api/auth-api";

const namePattern = "^hive-[1]\\d{4,6}$";

export function CreateCommunityPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const activeUser = useGlobalStore((s) => s.activeUser);
  const hsClientId = useGlobalStore((s) => s.hsClientId);

  const [fee, setFee] = useState("");
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [username, setUsername] = useState("");
  const [wif, setWif] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<null | "ok" | "conflict" | "not-valid">(
    null
  );
  const [keyDialog, setKeyDialog] = useState(false);
  const [creatorKey, setCreatorKey] = useState<PrivateKey | null>(null);
  const [done, setDone] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [progress, setProgress] = useState("");

  useMount(() => {
    client.database.getChainProperties().then((r) => {
      const asset = parseAsset(r.account_creation_fee.toString());
      const fee = `${numeral(asset.amount).format("0.000")} ${asset.symbol}`;
      setFee(fee);
    });
  });

  const genUsername = () => `hive-${Math.floor(Math.random() * 100000) + 100000}`;
  const genWif = () => "P" + base58.encode(cryptoUtils.sha256(random()));
  const genCredentials = () => {
    setUsername(genUsername());
    setWif(genWif());
  };
  const submitHot = async () => {
    const keys = makePrivateKeys();
    const auths = makeAuthorities(keys);
    const operation = makeOperation(auths, keys.memoKey);

    // create hive signer code from active private key to use after redirection from hivesigner
    const signer = (message: string): Promise<string> => {
      const hash = cryptoUtils.sha256(message);
      return new Promise<string>((resolve) => resolve(keys.activeKey.sign(hash).toString()));
    };
    const code = await makeHsCode(hsClientId, username, signer);
    if (code) {
      const callback = `${
        window.location.origin
      }/communities/create-hs?code=${code}&title=${encodeURIComponent(
        title
      )}&about=${encodeURIComponent(about)}`;
      hs.sendOperation(operation, { callback }, () => {});
    }
  };
  const makePrivateKeys = () => ({
    ownerKey: PrivateKey.fromLogin(username, wif, "owner"),
    activeKey: PrivateKey.fromLogin(username, wif, "active"),
    postingKey: PrivateKey.fromLogin(username, wif, "posting"),
    memoKey: PrivateKey.fromLogin(username, wif, "memo")
  });
  const submitKc = async () => {
    if (!activeUser) return;

    setInProgress(true);
    setProgress(i18next.t("communities-create.progress-account"));

    // create community account
    const keys = makePrivateKeys();
    const operation = [
      "account_create",
      {
        fee: fee,
        creator: activeUser.username,
        new_account_name: username,
        owner: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [[keys.ownerKey.createPublic().toString(), 1]]
        },
        active: {
          weight_threshold: 1,
          account_auths: [],
          key_auths: [[keys.activeKey.createPublic().toString(), 1]]
        },
        posting: {
          weight_threshold: 1,
          account_auths: [["ecency.app", 1]],
          key_auths: [[keys.postingKey.createPublic().toString(), 1]]
        },
        memo_key: keys.memoKey.createPublic().toString(),
        json_metadata: ""
      }
    ];

    try {
      await keychain.broadcast(activeUser!.username, [operation], "Active");
    } catch (e) {
      error(...formatError(e));
      setInProgress(false);
      setProgress("");
      return;
    }

    // Add account to keychain
    try {
      await keychain.addAccount(username, {
        active: keys.activeKey.toString(),
        posting: keys.postingKey.toString(),
        memo: keys.memoKey.toString()
      });
    } catch (e) {
      error(...formatError(e));
      setInProgress(false);
      setProgress("");
      return;
    }

    // create hive signer code from active private key
    const signer = (message: string): Promise<string> =>
      keychain.signBuffer(username, message, "Active").then((r) => r.result);
    const code = await makeHsCode(hsClientId, username, signer);

    return finalizeSubmit(code);
  };
  const makeAuthorities = (keys: {
    ownerKey: PrivateKey;
    activeKey: PrivateKey;
    postingKey: PrivateKey;
  }) => {
    const { ownerKey, activeKey, postingKey } = keys;

    return {
      ownerAuthority: Authority.from(ownerKey.createPublic()),
      activeAuthority: Authority.from(activeKey.createPublic()),
      postingAuthority: {
        ...Authority.from(postingKey.createPublic()),
        account_auths: [["ecency.app", 1]]
      } as Authority
    };
  };
  const checkUsername = useCallback(() => {
    setUsernameStatus(null);

    const re = new RegExp(namePattern);

    if (re.test(username)) {
      getAccount(username).then((r) => {
        if (r) {
          setUsernameStatus("conflict");
        } else {
          setUsernameStatus("ok");
        }
      });
    } else {
      setUsernameStatus("not-valid");
    }
  }, [username]);
  const makeOperation = (
    auths: { ownerAuthority: Authority; activeAuthority: Authority; postingAuthority: Authority },
    memoKey: PrivateKey
  ): AccountCreateOperation => [
    "account_create",
    {
      fee: fee,
      creator: activeUser!.username,
      new_account_name: username,
      owner: auths.ownerAuthority,
      active: auths.activeAuthority,
      posting: auths.postingAuthority,
      memo_key: memoKey.createPublic(),
      json_metadata: ""
    }
  ];
  const submit = async () => {
    if (!activeUser || !creatorKey) return;

    setInProgress(true);
    setProgress(i18next.t("communities-create.progress-account"));

    // create community account
    const keys = makePrivateKeys();
    const auths = makeAuthorities(keys);
    const operation = makeOperation(auths, keys.memoKey);

    try {
      await client.broadcast.sendOperations([operation], creatorKey);
    } catch (e) {
      error(...formatError(e));
      setInProgress(false);
      setProgress("");
      return;
    }

    setInProgress(true);
    setProgress(i18next.t("communities-create.progress-user"));

    // create hive signer code from active private key
    const signer = (message: string): Promise<string> => {
      const hash = cryptoUtils.sha256(message);
      return new Promise<string>((resolve) => resolve(keys.activeKey.sign(hash).toString()));
    };
    const code = await makeHsCode(hsClientId, username, signer);

    return finalizeSubmit(code);
  };
  const finalizeSubmit = async (hsCode: string) => {
    if (!activeUser) return;

    // get access token from code and create user object
    let user: User;
    try {
      user = await hsTokenRenew(hsCode).then((x) => ({
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
    // set admin role
    setProgress(i18next.t("communities-create.progress-role", { u: activeUser.username }));
    try {
      await setUserRole(username, username, activeUser.username, "admin");
    } catch (e) {
      error(...formatError(e));
      setInProgress(false);
      setProgress("");
      return;
    }

    // update community props
    setProgress(i18next.t("communities-create.progress-props"));

    try {
      await updateCommunity(username, username, {
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

    setInProgress(false);
    setDone(true);
  };

  useEffect(() => {
    checkUsername();
  }, [checkUsername, username, wif]);

  useEffect(() => {
    submit();
  }, [creatorKey, submit]);

  return (
    <>
      <Theme />
      <Feedback />
      <Navbar />

      <div className="app-content container-fluid">
        <div className="grid grid-cols-12 items-center justify-center m-0 w-full">
          <div className="col-span-6 hidden lg:block">
            <Image
              alt=""
              width={1000}
              height={1000}
              src="/assets/community-img.svg"
              className="w-full"
            />
          </div>
          <div className="col-span-12 sm:col-span-8 lg:col-span-5 p-0 sm:p-3">
            <div>
              <h1
                className={`text-[2.5rem] font-bold community-title ${
                  wif ? "mb-5" : ""
                } hidden lg:block`}
              >
                {i18next.t("communities-create.page-title")}
              </h1>
              <h1
                className={`community-title ${wif ? "mb-5" : ""} lg:hidden text-[2rem] font-bold`}
              >
                {i18next.t("communities-create.page-title")}
              </h1>
              {(!wif || !activeUser) && (
                <>
                  <ul className="descriptive-list list-disc ml-6">
                    <li>{i18next.t("communities-create.reason-one")}</li>
                    <li>{i18next.t("communities-create.reason-two")}</li>
                    <li>{i18next.t("communities-create.reason-three")}</li>
                  </ul>
                  <div className="learn-more mt-2 mb-4">
                    {i18next.t("g.learn-more")} <Link href="/faq">{i18next.t("g.faq")}</Link>
                  </div>
                </>
              )}

              {!wif && (
                <div className="col-span-12 lg:hidden p-0">
                  <Image
                    alt=""
                    width={1000}
                    height={1000}
                    src="/assets/community-img.svg"
                    className="w-full"
                  />
                </div>
              )}
              <Form
                ref={formRef}
                className={`community-form ${inProgress ? "in-progress" : ""}`}
                onSubmit={(e: React.FormEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!formRef.current?.checkValidity()) {
                    return;
                  }

                  if (wif === "") {
                    genCredentials();
                    return;
                  }

                  setKeyDialog(true);
                }}
              >
                {(() => {
                  if (done) {
                    const url = `/created/${username}`;
                    return (
                      <div className="done">
                        <p>{i18next.t("communities-create.done")}</p>
                        <p>
                          <strong>
                            <Link href={url}>
                              {i18next.t("communities-create.done-link-label")}
                            </Link>
                          </strong>
                        </p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {!wif && (
                        <>
                          <div className="mb-4">
                            <FormControl
                              type="text"
                              autoComplete="off"
                              autoFocus={true}
                              value={title}
                              minLength={3}
                              maxLength={20}
                              onChange={(e) => setTitle(e.target.value)}
                              required={true}
                              onInvalid={(e: any) =>
                                handleInvalid(e, "communities-create.", "title-validation")
                              }
                              onInput={(e: any) => e.target.setCustomValidity("")}
                              name="title"
                              aria-invalid={title.length <= 2 || title.length >= 21}
                              placeholder={i18next.t("communities-create.title")}
                            />
                          </div>
                          <div className="mb-4">
                            <FormControl
                              type="text"
                              autoComplete="off"
                              value={about}
                              maxLength={120}
                              onChange={(e) => setAbout(e.target.value)}
                              name="about"
                              placeholder={i18next.t("communities-create.about")}
                            />
                          </div>
                        </>
                      )}
                      {(() => {
                        if (activeUser && wif) {
                          return (
                            <>
                              <div className="mb-4">
                                <div className="flex items-center">
                                  <label className="mb-0 mr-2">
                                    {i18next.t("communities-create.fee")}
                                  </label>
                                  <Tooltip content={i18next.t("communities-create.reason-four")}>
                                    <span className="info-icon">{informationVariantSvg}</span>
                                  </Tooltip>
                                </div>
                                <div className="fee">{fee}</div>
                              </div>
                              <div className="mb-4">
                                <label className="mb-0">
                                  {i18next.t("communities-create.creator")}
                                </label>
                                <div>
                                  <Link className="creator" href={`/@${activeUser.username}`}>
                                    @{activeUser.username}
                                  </Link>
                                </div>
                              </div>
                              <div className="mb-4">
                                <label>{i18next.t("communities-create.username")}</label>
                                <FormControl
                                  type="text"
                                  autoComplete="off"
                                  value={username}
                                  maxLength={11}
                                  name="about"
                                  pattern={namePattern}
                                  title={i18next.t("communities-create.username-wrong-format")}
                                  onChange={(e) => setUsername(e.target.value)}
                                />
                                {usernameStatus === "ok" && (
                                  <small className="text-green flex p-2 items-center gap-2">
                                    <span className="w-6 h-6">{checkSvg}</span>
                                    {i18next.t("communities-create.username-available")}
                                  </small>
                                )}
                                {usernameStatus === "conflict" && (
                                  <small className="text-red">
                                    {alertCircleSvg}{" "}
                                    {i18next.t("communities-create.username-not-available")}
                                  </small>
                                )}
                                {usernameStatus === "not-valid" && (
                                  <small className="text-red">
                                    {alertCircleSvg}{" "}
                                    {i18next.t("communities-create.username-wrong-format")}
                                  </small>
                                )}
                              </div>
                              <div className="mb-4">
                                <label>{i18next.t("communities-create.password")}</label>
                                <div className="mb-4">
                                  <InputGroupCopyClipboard value={wif} />
                                </div>
                              </div>
                              <div className="mb-4">
                                <label className="label-text">
                                  <input
                                    type="checkbox"
                                    required={true}
                                    onInvalid={(e: any) =>
                                      handleInvalid(e, "communities-create.", "checkbox-validation")
                                    }
                                    onInput={handleOnInput}
                                  />{" "}
                                  {i18next.t("communities-create.confirmation")}
                                </label>
                              </div>
                              <div className="mb-4">
                                <Button
                                  appearance="link"
                                  size="lg"
                                  full={true}
                                  onClick={() => setWif("")}
                                  id="black-on-night"
                                >
                                  {i18next.t("g.back")}
                                </Button>
                              </div>
                              <div className="mb-4">
                                <Button
                                  type="submit"
                                  disabled={inProgress}
                                  size="lg"
                                  full={true}
                                  icon={inProgress && <Spinner className="w-3.5 h-3.5" />}
                                  iconPlacement="left"
                                >
                                  {i18next.t("communities-create.submit")}
                                </Button>
                              </div>
                              {inProgress && <p>{progress}</p>}
                            </>
                          );
                        }

                        if (!wif && activeUser) {
                          return (
                            <div className="mb-4">
                              <Button type="submit" size="lg" full={true}>
                                {i18next.t("g.next")}
                              </Button>
                            </div>
                          );
                        }

                        return (
                          !wif && (
                            <div className="mb-4">
                              <LoginRequired>
                                <Button type="button" full={true}>
                                  {i18next.t("g.next")}
                                </Button>
                              </LoginRequired>
                            </div>
                          )
                        );
                      })()}
                    </>
                  );
                })()}
              </Form>
            </div>
            {keyDialog && (
              <Modal
                show={true}
                centered={true}
                onHide={() => setKeyDialog(false)}
                className="community-key-modal"
              >
                <ModalHeader thin={true} closeButton={true} />
                <ModalBody>
                  <KeyOrHot
                    inProgress={false}
                    onKey={(key) => {
                      setKeyDialog(false);
                      setCreatorKey(key);
                    }}
                    onKc={() => {
                      setKeyDialog(false);
                      submitKc().then();
                    }}
                    onHot={() => {
                      setKeyDialog(false);
                      submitHot();
                    }}
                  />
                </ModalBody>
              </Modal>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
