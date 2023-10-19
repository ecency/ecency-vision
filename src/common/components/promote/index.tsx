import React, { Component } from "react";
import isEqual from "react-fast-compare";
import { PrivateKey } from "@hiveio/dhive";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { Entry, EntryHeader } from "../../store/entries/types";
import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import SuggestionList from "../suggestion-list";
import KeyOrHot from "../key-or-hot";
import { error } from "../feedback";
import { getPromotedPost, getPromotePrice, PromotePrice } from "../../api/private-api";
import { searchPath } from "../../api/search-api";
import { getPostHeader } from "../../api/bridge";
import { formatError, promote, promoteHot, promoteKc } from "../../api/operations";
import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";
import { checkAllSvg } from "../../img/svg";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";

interface Props {
  global: Global;
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
  prices: PromotePrice[];
  duration: number;
  inProgress: boolean;
  step: 1 | 2 | 3;
}

const pathComponents = (p: string): string[] => p.replace("@", "").split("/");

export class Promote extends BaseComponent<Props, State> {
  state: State = {
    balanceError: "",
    path: "",
    paths: [],
    postError: "",
    prices: [],
    duration: 1,
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

    return getPromotePrice(activeUser.username)
      .then((r) => {
        const prices = r.sort((a, b) => a.duration - b.duration);
        this.stateSet({ prices, duration: prices[1].duration, inProgress: false }, () => {
          this.checkBalance();
        });
      })
      .catch(() => {
        error(_t("g.server-error"));
      });
  };

  durationChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const duration = Number(e.target.value);
    this.stateSet({ duration }, () => {
      this.checkBalance();
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
    const { duration } = this.state;

    const { prices } = this.state;
    const { price } = prices?.find((x) => x.duration === duration)!;

    const balanceError =
      parseFloat(activeUser.points.points) < price ? _t("trx-common.insufficient-funds") : "";

    this.stateSet({ balanceError });
  };

  isValidPath = (p: string) => {
    if (p.indexOf("/") === -1) {
      return;
    }

    const [author, permlink] = pathComponents(p);
    return author.length >= 3 && permlink.length >= 3;
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

    // Check if the post already promoted
    const promoted = await getPromotedPost(activeUser.username, author, permlink);
    if (promoted) {
      this.stateSet({ postError: _t("redeem-common.post-promoted-exists"), inProgress: false });
      return;
    }

    this.stateSet({ inProgress: false, step: 2 });
  };

  sign = (key: PrivateKey) => {
    const { activeUser } = this.props;
    const { path, duration } = this.state;
    const [author, permlink] = pathComponents(path);

    this.setState({ inProgress: true });
    promote(key, activeUser.username, author, permlink, duration)
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

  signKc = () => {
    const { activeUser } = this.props;
    const { path, duration } = this.state;
    const [author, permlink] = pathComponents(path);

    this.setState({ inProgress: true });
    promoteKc(activeUser.username, author, permlink, duration)
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
    const { path, duration } = this.state;
    const [author, permlink] = pathComponents(path);

    promoteHot(activeUser.username, author, permlink, duration);
    onHide();
  };

  finish = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    const { activeUser } = this.props;
    const { prices, balanceError, path, paths, postError, duration, inProgress, step } = this.state;

    const canSubmit = !postError && !balanceError && this.isValidPath(path);

    return (
      <div className="promote-dialog-content">
        {step === 1 && (
          <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
            <div className="transaction-form-header">
              <div className="step-no">1</div>
              <div className="box-titles">
                <div className="main-title">{_t("promote.title")}</div>
                <div className="sub-title">{_t("promote.sub-title")}</div>
              </div>
            </div>
            {inProgress && <LinearProgress />}
            <div className="transaction-form-body flex flex-col">
              <div className="self-center mb-4">
                <a href="/faq#how-promotion-work">{_t("promote.learn-more")}</a>
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
                  {balanceError && <small className="pl-3 text-red">{balanceError}</small>}
                </div>
              </div>
              <div className="grid grid-cols-12 mb-4">
                <div className="col-span-12 sm:col-span-2 flex items-center">
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
                  {postError && <small className="pl-3 text-red">{postError}</small>}
                  {!postError && (
                    <small className="text-gray-600">{_t("redeem-common.post-hint")}</small>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-12 mb-4">
                <div className="col-span-12 sm:col-span-2 flex items-center">
                  <label>{_t("promote.duration")}</label>
                </div>
                <div className="col-span-12 sm:col-span-10">
                  <FormControl
                    type="select"
                    value={duration}
                    onChange={this.durationChanged}
                    disabled={inProgress}
                  >
                    {prices.map((p) => {
                      const { duration: d, price: pr } = p;
                      const label = `${d} ${d === 1 ? _t("g.day") : _t("g.days")} - ${pr} POINTS`;
                      return (
                        <option value={p.duration} key={p.duration}>
                          {label}
                        </option>
                      );
                    })}
                  </FormControl>
                </div>
              </div>
              <div className="grid grid-cols-12 mb-4">
                <div className="col-span-12 sm:col-span-2 flex items-center" />
                <div className="col-span-12 sm:col-span-10">
                  <Button onClick={this.next} disabled={!canSubmit || inProgress}>
                    {_t("g.next")}
                  </Button>
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
                onKc: this.signKc
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
              <p className="flex justify-center align-content-center">
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

export default class PromoteDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="promote-dialog"
        size="lg"
      >
        <ModalHeader thin={true} closeButton={true} />
        <ModalBody>
          <Promote {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
