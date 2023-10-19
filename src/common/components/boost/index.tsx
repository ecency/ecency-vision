import React, { Component } from "react";
import isEqual from "react-fast-compare";
import { PrivateKey } from "@hiveio/dhive";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ActiveUser } from "../../store/active-user/types";
import { Entry, EntryHeader } from "../../store/entries/types";
import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import SuggestionList from "../suggestion-list";
import KeyOrHot from "../key-or-hot";
import { error } from "../feedback";
import { getPostHeader } from "../../api/bridge";
import { getBoostedPost, getBoostOptions } from "../../api/private-api";
import { searchPath } from "../../api/search-api";
import { boost, boostHot, boostKc, formatError } from "../../api/operations";
import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";
import formattedNumber from "../../util/formatted-number";
import { checkAllSvg } from "../../img/svg";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  activeUser: ActiveUser;
  signingKey: string;
  entry?: Entry;
  updateActiveUser: (data?: Account) => void;
  setSigningKey: (key: string) => void;
  onHide: () => void;
}

interface State {
  balanceError: string;
  path: string;
  postError: string;
  paths: string[];
  options: number[];
  amount: number;
  inProgress: boolean;
  step: 1 | 2 | 3;
}

const pathComponents = (p: string): string[] => p.replace("@", "").split("/");

export class Boost extends BaseComponent<Props, State> {
  state: State = {
    balanceError: "",
    path: "",
    postError: "",
    paths: [],
    options: [],
    amount: 0,
    inProgress: true,
    step: 1
  };

  _timer: any = null;

  componentDidMount() {
    this.init()
      .then(() => {
        const { updateActiveUser } = this.props;
        updateActiveUser();
      })
      .then(() => {
        const { entry } = this.props;

        if (entry) {
          this.stateSet({ path: `${entry.author}/${entry.permlink}` });
        }
      });
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (!isEqual(this.props.activeUser.points, prevProps.activeUser.points)) {
      this.checkBalance();
    }
  }

  init = () => {
    const { activeUser } = this.props;

    return getBoostOptions(activeUser.username)
      .then((r) => {
        this.stateSet({ options: r, amount: r[0], inProgress: false }, () => {
          this.checkBalance();
        });
      })
      .catch(() => {
        error(_t("g.server-error"));
      });
  };

  pathChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const path = e.target.value;
    this.stateSet({ path, postError: "" });

    clearTimeout(this._timer);

    if (path.trim().length < 3) {
      this.stateSet({ paths: [] });
      return;
    }

    const { activeUser } = this.props;

    this._timer = setTimeout(
      () =>
        searchPath(activeUser.username, path).then((resp) => {
          this.stateSet({ paths: resp });
        }),
      500
    );
  };

  pathSelected = (path: string) => {
    this.stateSet({ path: path, paths: [] });
  };

  checkBalance = () => {
    const { activeUser } = this.props;
    const { amount } = this.state;

    const balanceError =
      parseFloat(activeUser.points.points) < amount ? _t("trx-common.insufficient-funds") : "";

    this.stateSet({ balanceError });
  };

  isValidPath = (p: string) => {
    if (p.indexOf("/") === -1) {
      return;
    }

    const [author, permlink] = pathComponents(p);
    return author.length >= 3 && permlink.length >= 3;
  };

  sliderChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = Number(e.target.value);
    this.stateSet({ amount }, () => {
      this.checkBalance();
    });
  };

  next = async () => {
    const { activeUser } = this.props;
    const { path } = this.state;

    const [author, permlink] = pathComponents(path);

    this.stateSet({ inProgress: true });

    // Check if post is valid
    let post: EntryHeader | null;
    try {
      post = await getPostHeader(author, permlink);
    } catch (e) {
      post = null;
    }

    if (!post) {
      this.stateSet({ postError: _t("redeem-common.post-error"), inProgress: false });
      return;
    }

    // Check if the post already boosted
    const boosted = await getBoostedPost(activeUser.username, author, permlink);
    if (boosted) {
      this.stateSet({ postError: _t("redeem-common.post-boosted-exists"), inProgress: false });
      return;
    }

    this.stateSet({ inProgress: false, step: 2 });
  };

  sign = (key: PrivateKey) => {
    const { activeUser } = this.props;
    const { path, amount } = this.state;
    const [author, permlink] = pathComponents(path);

    this.setState({ inProgress: true });
    boost(key, activeUser.username, author, permlink, `${amount}.000`)
      .then(() => {
        this.stateSet({ step: 3 });
      })
      .catch((err) => {
        error(...formatError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  signKs = () => {
    const { activeUser } = this.props;
    const { path, amount } = this.state;
    const [author, permlink] = pathComponents(path);

    this.setState({ inProgress: true });
    boostKc(activeUser.username, author, permlink, `${amount}.000`)
      .then(() => {
        this.stateSet({ step: 3 });
      })
      .catch((err) => {
        error(...formatError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  hotSign = () => {
    const { activeUser, onHide } = this.props;
    const { path, amount } = this.state;
    const [author, permlink] = pathComponents(path);

    boostHot(activeUser.username, author, permlink, `${amount}.000`);
    onHide();
  };

  finish = () => {
    const { onHide } = this.props;
    onHide();
  };

  pointsToSbd = (points: number) => {
    //const {dynamicProps} = this.props;
    //const {base, quote} = dynamicProps;
    return points / 150; //* 0.01 * (base / quote);
  };

  render() {
    const { activeUser } = this.props;

    const { balanceError, path, postError, amount, paths, options, inProgress, step } = this.state;

    const canSubmit = !postError && !balanceError && this.isValidPath(path);

    let sliderMin = 0;
    let sliderMax = 10;
    let sliderStep = 1;

    if (options.length > 1) {
      sliderMin = options[0];
      sliderMax = options[options.length - 1];
      sliderStep = options[1] - options[0];
    }

    return (
      <div className="boost-dialog-content">
        {step === 1 && (
          <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
            <div className="transaction-form-header">
              <div className="step-no">1</div>
              <div className="box-titles">
                <div className="main-title">{_t("boost.title")}</div>
                <div className="sub-title">{_t("boost.sub-title")}</div>
              </div>
            </div>
            {inProgress && <LinearProgress />}
            <div className="transaction-form-body flex flex-col">
              <div className="self-center mb-4">
                <a href="/faq#how-boosting-work">{_t("boost.learn-more")}</a>
              </div>
              <div className="grid grid-cols-12 mb-4">
                <div className="col-span-12 sm:col-span-2 flex items-center">
                  <label>{_t("redeem-common.balance")}</label>
                </div>
                <div className="col-span-12 sm:col-span-10">
                  <FormControl
                    type="text"
                    className={_c(`balance-input ${balanceError ? "is-invalid" : ""}`)}
                    plaintext={true}
                    readOnly={true}
                    value={`${activeUser.points.points} POINTS`}
                  />
                  {balanceError && <small className="text-red">{balanceError}</small>}
                </div>
              </div>
              <div className="grid grid-cols-12 mb-4">
                <div className="col-span-12 sm:col-span-2 sm:mt-3">
                  <label>{_t("redeem-common.post")}</label>
                </div>
                <div className="col-span-12 sm:col-span-10">
                  <SuggestionList items={paths} renderer={(i) => i} onSelect={this.pathSelected}>
                    <FormControl
                      className={postError ? "is-invalid" : ""}
                      type="text"
                      value={path}
                      onChange={this.pathChanged}
                      placeholder={_t("redeem-common.post-placeholder")}
                      disabled={inProgress}
                    />
                  </SuggestionList>
                  {postError && <small className="text-red">{postError}</small>}
                  {!postError && (
                    <small className="text-gray-600">{_t("redeem-common.post-hint")}</small>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-12 mb-4">
                <div className="col-span-12 sm:col-span-2 sm:mt-3">
                  <label>{_t("boost.amount")}</label>
                </div>
                <div className="col-span-12 sm:col-span-10">
                  <div className="slider-area">
                    <div className="slider-price">
                      {formattedNumber(this.pointsToSbd(amount), {
                        fractionDigits: 3,
                        suffix: "$"
                      })}
                      <small>{amount} POINTS</small>
                    </div>
                    <FormControl
                      type="range"
                      step={sliderStep}
                      min={sliderMin}
                      max={sliderMax}
                      value={amount}
                      onChange={this.sliderChanged}
                    />
                    <small className="text-gray-600">{_t("boost.slider-hint")}</small>
                  </div>
                </div>
              </div>
              <div className="flex mb-4">
                <div className="w-full sm:w-2/12" />
                <div className="w-full sm:w-10/12">
                  <Button type="button" onClick={this.next} disabled={!canSubmit || inProgress}>
                    {_t("g.next")}
                  </Button>
                  <div className="text-sm text-warning-default italic mt-1">{_t("boost.hint")}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
            <div className="transaction-form-header">
              <div className="step-no">2</div>
              <div className="box-titles">
                <div className="main-title">{_t("trx-common.sign-title")}</div>
                <div className="sub-title">{_t("trx-common.sign-sub-title")}</div>
              </div>
            </div>
            {inProgress && <LinearProgress />}
            <div className="transaction-form-body">
              {KeyOrHot({
                ...this.props,
                inProgress,
                onKey: this.sign,
                onHot: this.hotSign,
                onKc: this.signKs
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
            <div className="transaction-form-header">
              <div className="step-no">3</div>
              <div className="box-titles">
                <div className="main-title">{_t("trx-common.success-title")}</div>
                <div className="sub-title">{_t("trx-common.success-sub-title")}</div>
              </div>
            </div>
            {inProgress && <LinearProgress />}
            <div className="transaction-form-body">
              <p className="flex justify-center items-center">
                <span className="svg-icon text-green">{checkAllSvg}</span>{" "}
                {_t("redeem-common.success-message")}
              </p>
              <div className="flex justify-center">
                <Button onClick={this.finish}>{_t("g.finish")}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default class BoostDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="boost-dialog"
        size="lg"
      >
        <ModalHeader thin={true} closeButton={true} />
        <ModalBody>
          <Boost {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
