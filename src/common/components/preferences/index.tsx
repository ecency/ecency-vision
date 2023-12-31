import React from "react";
import i18n from "i18next";
import { Col, Form, FormControl, InputGroup, Button } from "react-bootstrap";

import { Global, Theme } from "../../store/global/types";
import BaseComponent from "../base";
import { success, error } from "../feedback";
import { _t, langOptions } from "../../i18n";
import { getCurrencyRate } from "../../api/misc";
import currencySymbol from "../../helper/currency-symbol";
import currencies from "../../constants/currencies.json";
import { ActiveUser } from "../../store/active-user/types";
import { copyContent } from "../../img/svg";
import * as ls from "../../util/local-storage";
import {
  postBodySummary,
  proxifyImageSrc,
  renderPostBody,
  setProxyBase
} from "@ecency/render-helper";
import * as defaults from "../../constants/defaults.json";

interface Props {
  global: Global;
  muteNotifications: () => void;
  unMuteNotifications: () => void;
  setCurrency: (currency: string, rate: number, symbol: string) => void;
  setLang: (lang: string) => void;
  setNsfw: (value: boolean) => void;
  activeUser: ActiveUser;
  toggleTheme: (theme_key?: string) => void;
  setShowSelfVote: (value: boolean) => void;
  setShowRewardSplit: (value: boolean) => void;
  setLowRewardThreshold: (value: number) => void;
  setShowFrontEnd: (value: boolean) => void;
  setFooter: (value: string) => void;
}

interface State {
  inProgress: boolean;
  defaultTheme: string;
}

export class Preferences extends BaseComponent<Props, State> {
  state: State = {
    inProgress: false,
    defaultTheme: ""
  };

  constructor(props: Props) {
    super(props);
    const { setFooter } = props;
    let footer = ls.get("footer");
    if (!footer) {
      footer = defaults.footer || "";
    }
    if (props.global.footer != footer) {
      console.log("settting footer:", footer);
      setFooter(footer);
    }
  }

  notificationsChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { muteNotifications, unMuteNotifications } = this.props;

    if (e.target.value === "1") {
      unMuteNotifications();
    }

    if (e.target.value === "0") {
      muteNotifications();
    }

    success(_t("preferences.updated"));
  };

  themeChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { toggleTheme } = this.props;
    const { value } = e.target;
    if (value === "system") {
      ls.set("use_system_theme", true);
    } else {
      ls.remove("use_system_theme");
      ls.set("theme", value);
    }
    this.setState({ ...this.state, defaultTheme: value });
    toggleTheme(value);
    success(_t("preferences.updated"));
  };

  currencyChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { value: currency } = e.target;

    this.stateSet({ inProgress: true });
    getCurrencyRate(currency)
      .then((rate) => {
        const symbol = currencySymbol(currency);
        const { setCurrency } = this.props;

        setCurrency(currency, rate, symbol);
        success(_t("preferences.updated"));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  languageChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { setLang } = this.props;
    const { value: code } = e.target;

    i18n.changeLanguage(code).then(() => {
      setLang(code);
      success(_t("preferences.updated"));
    });
  };

  nsfwChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { setNsfw } = this.props;
    const { value } = e.target;

    setNsfw(Boolean(Number(value)));
    success(_t("preferences.updated"));
  };

  showSelfVoteChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { setShowSelfVote } = this.props;
    const { value } = e.target;
    const parsedValue = JSON.parse(value);
    setShowSelfVote(parsedValue);
    success(_t("preferences.updated"));
  };

  showRewardSplitChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { setShowRewardSplit } = this.props;
    const { value } = e.target;
    setShowRewardSplit(JSON.parse(value));
    success(_t("preferences.updated"));
  };

  showFrontEndChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { setShowFrontEnd } = this.props;
    const { value } = e.target;

    setShowFrontEnd(JSON.parse(value));
    success(_t("preferences.updated"));
  };

  footerChanged = (e: React.ChangeEvent<typeof Form.Control & HTMLInputElement>) => {
    const { setFooter, global } = this.props;
    const oldValue = global.footer;
    const { value } = e.target;
    setFooter(value);
    success(_t("preferences.updated"));
  };

  lowRewardThresholdChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    const { setLowRewardThreshold, global } = this.props;
    const { lowRewardThreshold } = global;
    const { value } = e.target;
    console.log({ lowRewardThreshold });
    try {
      const newValue = JSON.parse(value);
      if (typeof newValue !== "number") {
        throw new Error("parsed value but not a number");
      }
      setLowRewardThreshold(newValue);
      success(_t("preferences.updated"));
    } catch (e) {
      error(_t("preferences.not-a-number"));
    }
  };

  copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("profile-edit.copied"));
  };

  componentDidMount() {
    const { props } = this;
    let use_system_theme = ls.get("use_system_theme", false);
    let theme = ls.get("theme");
    if (use_system_theme) {
      theme = "system";
    }
    this.setState({ ...this.state, defaultTheme: theme });
  }

  render() {
    const { global, activeUser } = this.props;
    const { inProgress } = this.state;
    let footer = ls.get("footer");
    if (!footer) {
      footer = defaults.footer || "";
    }
    let renderedFooterPreview = renderPostBody(footer || "", false, global.canUseWebp);

    return (
      <>
        <div className="preferences">
          <div className="preferences-header">{_t("preferences.title")}</div>

          <Form.Row>
            <Col lg={6} xl={4}>
              <Form.Group>
                <Form.Label>{_t("preferences.notifications")}</Form.Label>
                <Form.Control
                  type="text"
                  value={global.notifications ? 1 : 0}
                  as="select"
                  onChange={this.notificationsChanged}
                >
                  <option value={1}>{_t("g.on")}</option>
                  <option value={0}>{_t("g.off")}</option>
                </Form.Control>
              </Form.Group>
            </Col>
            <Col lg={6} xl={4}>
              <Form.Group>
                <Form.Label>{_t("preferences.currency")}</Form.Label>
                <Form.Control
                  type="text"
                  value={global.currency}
                  as="select"
                  onChange={this.currencyChanged}
                  disabled={inProgress}
                >
                  {currencies.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col lg={6} xl={4}>
              <Form.Group>
                <Form.Label>{_t("preferences.language")}</Form.Label>
                <Form.Control
                  type="text"
                  value={global.lang}
                  as="select"
                  onChange={this.languageChanged}
                  disabled={inProgress}
                >
                  {langOptions.map((x) => (
                    <option key={x.code} value={x.code}>
                      {x.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Form.Row>
          <Form.Row>
            <Col lg={6} xl={4}>
              <Form.Group>
                <Form.Label>{_t("preferences.nsfw")}</Form.Label>
                <Form.Control
                  type="text"
                  value={global.nsfw ? 1 : 0}
                  as="select"
                  onChange={this.nsfwChanged}
                >
                  <option value={1}>{_t("g.on")}</option>
                  <option value={0}>{_t("g.off")}</option>
                </Form.Control>
              </Form.Group>
            </Col>

            {activeUser && activeUser.username && (
              <>
                <Col lg={6} xl={4}>
                  <Form.Group>
                    <Form.Label>{_t("preferences.referral-link")}</Form.Label>
                    <InputGroup
                      className="mb-3"
                      onClick={() =>
                        this.copyToClipboard(
                          `https://ecency.com/signup?referral=${activeUser!.username}`
                        )
                      }
                    >
                      <Form.Control
                        value={`https://ecency.com/signup?referral=${activeUser!.username}`}
                        disabled={true}
                        className="text-primary pointer"
                      />
                      <InputGroup.Append>
                        <Button
                          variant="primary"
                          size="sm"
                          className="copy-to-clipboard"
                          onClick={() =>
                            this.copyToClipboard(
                              `https://ecency.com/signup?referral=${activeUser!.username}`
                            )
                          }
                        >
                          {copyContent}
                        </Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col lg={6} xl={4}>
                  <Form.Group>
                    <Form.Label>{_t("preferences.theme")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={Theme[this.state.defaultTheme]}
                      as="select"
                      onChange={this.themeChanged}
                    >
                      <option value={Theme.system}>{_t("preferences.theme-system-default")}</option>
                      <option value={Theme.day}>{_t("preferences.theme-day")}</option>
                      <option value={Theme.night}>{_t("preferences.theme-night")}</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col lg={6} xl={12}>
                  {_t("preferences.entry-item-options")}{" "}
                </Col>
                <hr />
                <Col lg={6} xl={4}>
                  <Form.Group>
                    <Form.Label>{_t("preferences.show-self-vote")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={JSON.stringify(global.showSelfVote)}
                      as="select"
                      onChange={this.showSelfVoteChanged}
                    >
                      <option value={"true"}>{_t("preferences.show-self-vote-true")}</option>
                      <option value={"false"}>{_t("preferences.show-self-vote-false")}</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col lg={6} xl={4}>
                  <Form.Group>
                    <Form.Label>{_t("preferences.show-reward-split")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={JSON.stringify(global.showRewardSplit)}
                      as="select"
                      onChange={this.showRewardSplitChanged}
                    >
                      <option value={"true"}>{_t("preferences.show-reward-split-true")}</option>
                      <option value={"false"}>{_t("preferences.show-reward-split-false")}</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col lg={6} xl={4}>
                  <Form.Group>
                    <Form.Label>{_t("preferences.low-reward-threshold")}</Form.Label>
                    <Form.Control
                      type="text"
                      defaultValue={global.lowRewardThreshold}
                      onChange={this.lowRewardThresholdChanged}
                    />
                  </Form.Group>
                </Col>
                <Col lg={6} xl={4}>
                  <Form.Group>
                    <Form.Label>{_t("preferences.show-front-end")}</Form.Label>
                    <Form.Control
                      type="text"
                      value={JSON.stringify(global.showFrontEnd)}
                      as="select"
                      onChange={this.showFrontEndChanged}
                    >
                      <option value={"true"}>{_t("preferences.show-reward-split-true")}</option>
                      <option value={"false"}>{_t("preferences.show-reward-split-false")}</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col lg={6} xl={12}>
                  <Form.Group>
                    <Form.Label>{_t("preferences.footer")}</Form.Label>
                    <Form.Control
                      id="the-footer-editor"
                      className="the-editor accepts-emoji form-control"
                      as="textarea"
                      placeholder={_t("submit.body-placeholder")}
                      defaultValue={footer}
                      onChange={this.footerChanged}
                      spellCheck={true}
                    />
                  </Form.Group>
                </Col>
                <Col xl={12}>
                  <Form.Label>{_t("preferences.footer-preview")}</Form.Label>
                  <br />
                  <div
                    className="preview-body markdown-view"
                    dangerouslySetInnerHTML={{ __html: renderedFooterPreview }}
                  />
                </Col>
              </>
            )}
          </Form.Row>
        </div>
      </>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    activeUser: p.activeUser,
    muteNotifications: p.muteNotifications,
    unMuteNotifications: p.unMuteNotifications,
    setCurrency: p.setCurrency,
    setLang: p.setLang,
    setNsfw: p.setNsfw,
    toggleTheme: p.toggleTheme,
    setShowSelfVote: p.setShowSelfVote,
    setShowRewardSplit: p.setShowRewardSplit,
    setLowRewardThreshold: p.setLowRewardThreshold,
    setShowFrontEnd: p.setShowFrontEnd,
    setFooter: p.setFooter
  };

  return <Preferences {...props} />;
};
