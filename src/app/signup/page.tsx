"use client";

import ReCAPTCHA from "react-google-recaptcha";
import qrcode from "qrcode";
import axios from "axios";
import "./_sign-up.scss";
import { Spinner } from "@ui/spinner";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import useDebounce from "react-use/lib/useDebounce";
import { useLocalStorage, useMount } from "react-use";
import { PREFIX } from "@/utils/local-storage";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import i18next from "i18next";
import { getAccounts } from "@/api/hive";
import { signUp } from "@/api/private-api";
import { error, Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";
import { b64uEnc, handleInvalid, handleOnInput } from "@/utils";
import Head from "next/head";
import { appleSvg, checkSvg, googleSvg, hiveSvg } from "@ui/svg";
import { Tsx } from "@/features/i18n/helper";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";

enum Stage {
  FORM = "form",
  REGISTER_TYPE = "register-type",
  BUY_ACCOUNT = "buy-account"
}

export default function SignUp() {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);

  const [lsReferral, setLsReferral] = useLocalStorage<string>(PREFIX + "_referral");

  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [referralError, setReferralError] = useState("");
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [referralTouched, setReferralTouched] = useState(false);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [referral, setReferral] = useState("");
  const [lockReferral, setLockReferral] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [done, setDone] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [stage, setStage] = useState<Stage>(Stage.FORM);
  const [url, setUrl] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [urlHash, setUrlHash] = useState("");

  const form = useRef<any>();
  const qrCodeRef = useRef<any>();

  const params = useSearchParams();
  const router = useRouter();

  useMount(() => {
    const referral = params.get("referral");
    if (referral && typeof referral === "string") {
      setReferral(referral);
      setLockReferral(true);
    } else if (lsReferral && typeof lsReferral === "string") {
      router.push(`/signup?referral=${lsReferral}`);
      setReferral(lsReferral);
    } else {
      router.push("/signup");
    }
  });

  useEffect(() => {
    if (stage === Stage.BUY_ACCOUNT) {
      const url = new URL("https://ecency.com");
      url.pathname = "purchase";

      const params = new URLSearchParams();
      params.set("username", username);
      params.set("email", email);
      params.set("referral", referral);
      params.set("type", "account");
      url.search = params.toString();

      setUrl(url.toString());
      compileQR(url.toString());
    }
  }, [email, referral, stage, username]);

  useEffect(() => {
    setUsernameError("");
    setIsDisabled(false);

    if (!username && !usernameTouched) {
      return;
    }
    if (username.length > 16) {
      setUsernameError(i18next.t("sign-up.username-max-length-error"));
      setIsDisabled(true);
    } else {
      username.split(".").some((item) => {
        if (item.length < 3) {
          setUsernameError(i18next.t("sign-up.username-min-length-error"));
          setIsDisabled(true);
        } else if (!/^[\x00-\x7F]*$/.test(item[0])) {
          setUsernameError(i18next.t("sign-up.username-no-ascii-first-letter-error"));
          setIsDisabled(true);
        } else if (!/^([a-zA-Z0-9]|-|\.)+$/.test(item)) {
          setUsernameError(i18next.t("sign-up.username-contains-symbols-error"));
          setIsDisabled(true);
        } else if (item.includes("--")) {
          setUsernameError(i18next.t("sign-up.username-contains-double-hyphens"));
          setIsDisabled(true);
        } else if (/^\d/.test(item)) {
          setUsernameError(i18next.t("sign-up.username-starts-number"));
          setIsDisabled(true);
        }
      });
    }
  }, [username, usernameTouched]);

  useDebounce(
    () => {
      if (username?.length >= 3) {
        getAccounts([username]).then((r) => {
          if (r.length > 0) {
            setUsernameError(i18next.t("sign-up.username-exists"));
            setIsDisabled(true);
          }
        });
      }
    },
    1000,
    [username]
  );

  useEffect(() => {
    if (email.length > 72) {
      setEmailError(i18next.t("sign-up.email-max-length-error"));
    } else {
      setEmailError("");
    }
  }, [email]);

  useEffect(() => {
    setReferralError("");
    setIsDisabled(false);

    if (!referral) {
      return;
    }
    if (referral.length > 16) {
      setReferralError(i18next.t("sign-up.referral-max-length-error"));
      setIsDisabled(true);
    } else {
      referral.split(".").some((item) => {
        if (item.length < 3) {
          setReferralError(i18next.t("sign-up.referral-min-length-error"));
          setIsDisabled(true);
        }
      });
    }
  }, [referral, referralTouched]);

  const regularRegister = async () => {
    setInProgress(true);
    try {
      const response = await signUp(username, email, referral);
      if (!isVerified) {
        error(i18next.t("login.captcha-check-required"));
        return;
      }
      if (response?.data?.code) {
        setRegistrationError(response.data.code);
      } else {
        setDone(true);
        setLsReferral(undefined);
        setStage(Stage.FORM);
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.data?.message) {
        setRegistrationError(e.response.data.message);
      }
    } finally {
      setInProgress(false);
    }
  };

  const compileQR = async (url: string) => {
    if (qrCodeRef.current) {
      qrCodeRef.current.src = await qrcode.toDataURL(url, { width: 300 });
    }
  };

  const captchaCheck = (value: string | null) => {
    if (value) {
      setIsVerified(true);
    }
  };

  const encodeUrlInfo = (username: string, email: string, referral: string) => {
    const accInfo = {
      username,
      email,
      referral
    };
    try {
      const stringifiedInfo = JSON.stringify(accInfo);
      const hashedInfo = b64uEnc(stringifiedInfo);
      setUrlHash(hashedInfo);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Head>
        <title>{i18next.t("sign-up.header")}</title>
      </Head>
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />
      <div className="app-content sign-up-page mb-lg-0">
        <div className="sign-up">
          <div className={"left-image " + stage}>
            <Image src="/assets/signup.png" width={1000} height={1000} alt="Signup" />
          </div>
          <div className="the-form">
            {stage === Stage.FORM ? (
              <>
                <div className="form-title">{i18next.t("sign-up.header")}</div>
                <div className="form-sub-title">{i18next.t("sign-up.description")}</div>
                <div className="flex items-center justify-center form-icons">
                  <Image
                    width={100}
                    height={100}
                    src="/assets/logo-circle.svg"
                    alt="Ecency"
                    title="Ecency"
                  />
                  <span title="Hive">{hiveSvg}</span>
                </div>

                <div className="flex items-center justify-center form-image">
                  <Image width={1000} height={1000} src="/assets/signup.png" alt="Signup" />
                </div>

                <div className="bottom-description text-center">
                  {i18next.t("sign-up.bottom-description")}
                </div>

                <Tsx k="sign-up.learn-more">
                  <div className="form-faq" />
                </Tsx>

                {done ? (
                  <div className="form-done">
                    <div className="done-icon">{checkSvg}</div>
                    <div className="done-text">
                      <p>{i18next.t("sign-up.success", { email })}</p>
                      <p>{i18next.t("sign-up.success-2")}</p>
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <></>
            )}
            {!done && stage === Stage.FORM ? (
              <div className="form-content">
                <Form
                  className="form-content"
                  ref={form}
                  onSubmit={async (e: React.FormEvent) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!form.current?.checkValidity()) {
                      return;
                    }

                    if (usernameError || referralError || emailError) {
                      return;
                    }

                    const existingAccount = await getAccounts([username]);
                    if (existingAccount.length > 0) {
                      setUsernameError(i18next.t("sign-up.username-exists"));
                      return;
                    }

                    const referralIsValid = await getAccounts([referral]);
                    if (referralIsValid.length === 0 && referral !== "") {
                      setReferralError(i18next.t("sign-up.referral-invalid"));
                      return;
                    }

                    if (stage === Stage.FORM) {
                      setStage(Stage.REGISTER_TYPE);
                    }

                    if ((username && email) || referral) {
                      encodeUrlInfo(username, email, referral);
                    }
                  }}
                >
                  <div className="mb-4">
                    <FormControl
                      type="text"
                      placeholder={i18next.t("sign-up.username")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      autoFocus={true}
                      required={true}
                      onInvalid={(e: any) => handleInvalid(e, "sign-up.", "validation-username")}
                      aria-invalid={usernameError !== ""}
                      onInput={handleOnInput}
                      onBlur={() => setUsernameTouched(true)}
                    />
                    <small className="text-red pl-3">{usernameError}</small>
                  </div>
                  <div className="mb-4">
                    <FormControl
                      type="email"
                      placeholder={i18next.t("sign-up.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={true}
                      onInvalid={(e: any) => handleInvalid(e, "sign-up.", "validation-email")}
                      aria-invalid={emailError !== ""}
                      onInput={handleOnInput}
                    />
                    <small className="text-red pl-3">{emailError}</small>
                  </div>
                  <div className="mb-4">
                    <FormControl
                      type="text"
                      placeholder={i18next.t("sign-up.ref")}
                      value={referral}
                      onChange={(e) => setReferral(e.target.value.toLowerCase())}
                      disabled={lockReferral}
                      aria-invalid={referralError !== ""}
                      onBlur={() => setReferralTouched(true)}
                    />
                    <small className="text-red pl-3">{referralError}</small>
                  </div>
                  <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                    <ReCAPTCHA
                      sitekey="6LdEi_4iAAAAAO_PD6H4SubH5Jd2JjgbIq8VGwKR"
                      onChange={captchaCheck}
                      size="normal"
                    />
                  </div>
                  {stage === Stage.FORM ? (
                    <>
                      <div className="flex justify-center">
                        <Button
                          className="block"
                          type="submit"
                          disabled={inProgress || !isVerified || isDisabled}
                          icon={inProgress && <Spinner className="w-3.5 h-3.5" />}
                          iconPlacement="left"
                        >
                          {i18next.t("sign-up.submit")}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </Form>
                <div className="text-center">
                  {i18next.t("sign-up.login-text-1")}
                  <a className="pl-1" href="#" onClick={(e) => toggleUIProp("login")}>
                    {i18next.t("sign-up.login-text-2")}
                  </a>
                </div>
              </div>
            ) : (
              <></>
            )}

            {stage === Stage.REGISTER_TYPE ? (
              <div className="form-content">
                <div className="card border border-[--border-color] bg-white rounded mb-3 mt-5">
                  <div className="bg-gray-100 dark:bg-gray-800 border-b border-[--border-color] p-3">
                    <b>{i18next.t("sign-up.free-account")}</b>
                  </div>
                  <div className="p-3">
                    <div>{i18next.t("sign-up.free-account-desc")}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 border-t border-[--border-color] py-2 px-3">
                    <Button
                      className="w-full"
                      onClick={regularRegister}
                      icon={inProgress && <Spinner className="w-3.5 h-3.5" />}
                    >
                      {i18next.t("sign-up.register-free")}
                    </Button>
                  </div>
                  {registrationError.length > 0 && (
                    <div className="error">
                      <small className="error-info">{registrationError}</small>
                    </div>
                  )}
                </div>
                <div className="card border bg-white border-[--border-color] rounded mb-3">
                  <div className="bg-gray-100 dark:bg-gray-800 border-b border-[--border-color] p-3">
                    <b>{i18next.t("sign-up.buy-account")}</b>
                  </div>
                  <div className="p-3">
                    <p>{i18next.t("sign-up.buy-account-desc")}</p>
                    <ul>
                      <li>{i18next.t("sign-up.buy-account-li-1")}</li>
                      <li>{i18next.t("sign-up.buy-account-li-2")}</li>
                      <li>{i18next.t("sign-up.buy-account-li-3")}</li>
                    </ul>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 border-t border-[--border-color] py-2 px-3">
                    <Button className="w-full" onClick={() => setStage(Stage.BUY_ACCOUNT)}>
                      {i18next.t("sign-up.buy-account")} – $2.99
                    </Button>
                  </div>
                </div>

                <div className="card border bg-white border-[--border-color] rounded mb-3">
                  <div className="bg-gray-100 dark:bg-gray-800 border-b border-[--border-color] p-3">
                    <b>
                      {activeUser
                        ? i18next.t("onboard.title-active-user")
                        : i18next.t("onboard.title-visitor")}
                    </b>
                  </div>
                  <div className="p-3">
                    <p>
                      {activeUser
                        ? i18next.t("onboard.description-active-user")
                        : i18next.t("onboard.description-visitor")}
                    </p>
                    <ul>
                      {activeUser && <li>{i18next.t("onboard.creating-description")}</li>}
                      {!activeUser && <li>{i18next.t("onboard.asking-description")}</li>}
                    </ul>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 border-t border-[--border-color] py-2 px-3">
                    <Link href={`/onboard-friend/asking/${urlHash}`}>
                      <Button className="w-full">
                        {activeUser ? i18next.t("onboard.creating") : i18next.t("onboard.asking")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}

            {stage === Stage.BUY_ACCOUNT ? (
              <div className="flex items-center flex-col justify-center">
                <div className="my-3">{i18next.t("sign-up.qr-desc")}</div>
                <a href={url}>
                  <Image src="" alt="" width={1000} height={1000} ref={qrCodeRef} />
                </a>
                <div className="flex flex-col my-4 mb-16 gap-4 sm:flex-row">
                  <a href="https://ios.ecency.com" className="app-btn" target="_blank">
                    <i className="icon">{appleSvg}</i>
                    <span className="text">Download on the</span>
                    <span className="headline">AppStore</span>
                  </a>
                  <a href="https://android.ecency.com" className="app-btn" target="_blank">
                    <i className="icon">{googleSvg}</i>
                    <span className="text">Get it on</span>
                    <span className="headline">GooglePlay</span>
                  </a>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
