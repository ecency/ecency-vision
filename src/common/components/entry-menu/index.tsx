import React from "react";

import { History } from "history";

import BaseComponent from "../base";

import { ActiveUser } from "../../store/active-user/types";
import { Entry, EntryStat } from "../../store/entries/types";
import { Communities, Community, ROLES } from "../../store/communities/types";
import { EntryPinTracker } from "../../store/entry-pin-tracker/types";
import { Global } from "../../store/global/types";
import { Account, FullAccount } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ToggleType } from "../../store/ui/types";

import { clone } from "../../store/util";

import EditHistory from "../edit-history";
import EntryShare, { shareReddit, shareTwitter, shareFacebook } from "../entry-share";
import MuteBtn from "../mute-btn";
import Promote from "../promote";
import Boost from "../boost";
import ModalConfirm from "../modal-confirm";
import { error, info, success } from "../feedback";
import DropDown, { MenuItem } from "../dropdown";
import CrossPost from "../cross-post";

import isCommunity from "../../helper/is-community";

import { _t } from "../../i18n";

import clipboard from "../../util/clipboard";

import { deleteComment, formatError, pinPost, updateProfile } from "../../api/operations";
import { getAccount } from "../../api/hive";

import * as bridgeApi from "../../api/bridge";

import {
  dotsHorizontal,
  deleteForeverSvg,
  pencilOutlineSvg,
  pinSvg,
  historySvg,
  shareVariantSvg,
  linkVariantSvg,
  volumeOffSvg,
  redditSvg,
  twitterSvg,
  facebookSvg,
  bullHornSvg,
  rocketLaunchSvg,
  shuffleVariantSvg
} from "../../img/svg";
import "./_index.scss";
import { useMappedStore } from "../../store/use-mapped-store";

interface Props {
  history: History;
  global: Global;
  dynamicProps: DynamicProps;
  activeUser: ActiveUser | null;
  entry: Entry;
  extraMenuItems?: any[];
  communities: Communities;
  entryPinTracker: EntryPinTracker;
  separatedSharing?: boolean;
  alignBottom?: boolean;
  signingKey: string;
  setSigningKey: (key: string) => void;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
  updateEntry: (entry: any) => void;
  addCommunity: (data: Community) => void;
  trackEntryPin: (entry: Entry) => void;
  setEntryPin: (entry: Entry, pin: boolean) => void;
  toggleUIProp: (what: ToggleType) => void;
  toggleEdit?: () => void;
  pinEntry?: (entry: Entry | null) => void;
}

interface State {
  cross: boolean;
  share: boolean;
  editHistory: boolean;
  delete_: boolean;
  pin: boolean;
  pinKey: string;
  unpin: boolean;
  mute: boolean;
  promote: boolean;
  boost: boolean;
}

export class EntryMenu extends BaseComponent<Props, State> {
  state: State = {
    cross: false,
    share: false,
    editHistory: false,
    delete_: false,
    pin: false,
    pinKey: "",
    unpin: false,
    mute: false,
    promote: false,
    boost: false
  };

  componentDidMount() {
    const { activeUser } = this.props;

    if (!activeUser) {
      return;
    }

    const { trackEntryPin, entry } = this.props;
    trackEntryPin(entry);

    if (this.getCommunity()) {
      return;
    }

    const { addCommunity } = this.props;

    if (isCommunity(entry.category)) {
      bridgeApi.getCommunity(entry.category, activeUser.username).then((r) => {
        if (r) {
          addCommunity(r);
        }
      });
    }
  }

  toggleCross = () => {
    const { cross } = this.state;
    this.stateSet({ cross: !cross });
  };

  toggleShare = () => {
    const { share } = this.state;
    this.stateSet({ share: !share });
  };

  toggleEditHistory = () => {
    const { editHistory } = this.state;
    this.stateSet({ editHistory: !editHistory });
  };

  toggleDelete = () => {
    const { delete_ } = this.state;
    this.stateSet({ delete_: !delete_ });
  };

  togglePin = (key?: string) => {
    const { pin } = this.state;
    this.stateSet({ pin: !pin, pinKey: key ? key : "" });
  };

  toggleUnpin = (key?: string) => {
    const { unpin } = this.state;
    this.stateSet({ unpin: !unpin, pinKey: key ? key : "" });
  };

  toggleMute = () => {
    const { mute } = this.state;
    this.stateSet({ mute: !mute });
  };

  togglePromote = () => {
    const { promote } = this.state;
    this.stateSet({ promote: !promote });
  };

  toggleBoost = () => {
    const { boost } = this.state;
    this.stateSet({ boost: !boost });
  };

  getCommunity = (): Community | null => {
    const { communities, entry } = this.props;

    return communities.find((x) => x.name === entry.category) || null;
  };

  canMute = () => {
    const { activeUser } = this.props;

    const community = this.getCommunity();

    return activeUser && community
      ? !!community.team.find((m) => {
          return (
            m[0] === activeUser.username &&
            [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
          );
        })
      : false;
  };

  canPin = () => {
    const { activeUser, entry } = this.props;

    const community = this.getCommunity();
    const ownEntry = (activeUser && activeUser.username === entry.author) || !community;

    return activeUser && community
      ? !!community.team.find((m) => {
          return (
            m[0] === activeUser.username &&
            [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
          );
        })
      : ownEntry;
  };

  canPinBothOptions = () => {
    const { activeUser, entry } = this.props;

    const community = this.getCommunity();
    const ownEntry = activeUser && activeUser.username === entry.author;

    return activeUser && community && ownEntry
      ? !!community.team.find((m) => {
          return (
            m[0] === activeUser.username &&
            [ROLES.OWNER.toString(), ROLES.ADMIN.toString(), ROLES.MOD.toString()].includes(m[1])
          );
        })
      : false;
  };

  copyAddress = () => {
    const { entry, activeUser } = this.props;
    let u;
    if (activeUser?.username) {
      u = `https://ecency.com/${entry.category}/@${entry.author}/${entry.permlink}?referral=${activeUser.username}`;
    } else {
      u = `https://ecency.com/${entry.category}/@${entry.author}/${entry.permlink}`;
    }
    clipboard(u);
    success(_t("entry.address-copied"));
  };

  edit = () => {
    const { entry, history } = this.props;

    const u = `/@${entry.author}/${entry.permlink}/edit`;
    history.push(u);
  };

  delete = () => {
    const { history, activeUser, entry } = this.props;
    deleteComment(activeUser!.username, entry.author, entry.permlink)
      .then(() => {
        history.push("/");
      })
      .catch((e) => {
        error(...formatError(e));
      });
  };

  pinToCommunity = (pin: boolean) => {
    const { entry, activeUser, setEntryPin, updateEntry } = this.props;
    const community = this.getCommunity();

    pinPost(activeUser!.username, community!.name, entry.author, entry.permlink, pin)
      .then(() => {
        setEntryPin(entry, pin);

        // Update the entry in store
        const nStats: EntryStat = { ...clone(entry.stats), is_pinned: pin };
        const nEntry: Entry = { ...clone(entry), stats: nStats };
        updateEntry(nEntry);

        if (pin) {
          success(_t("entry-menu.pin-success"));
        } else {
          success(_t("entry-menu.unpin-success"));
        }
      })
      .catch((err) => {
        error(...formatError(err));
      });
  };

  pinToBlog = (pin: boolean) => {
    const { entry, activeUser, addAccount, updateActiveUser } = this.props;

    const ownEntry = activeUser && activeUser.username === entry.author;
    const { profile, name } = activeUser!.data as FullAccount;

    if (ownEntry && pin && profile && activeUser) {
      const newProfile = {
        name: profile?.name || "",
        about: profile?.about || "",
        cover_image: profile?.cover_image || "",
        profile_image: profile?.profile_image || "",
        website: profile?.website || "",
        location: profile?.location || "",
        pinned: entry.permlink
      };
      updateProfile(activeUser.data, newProfile)
        .then((r) => {
          success(_t("entry-menu.pin-success"));
          return getAccount(name);
        })
        .then((account) => {
          // update reducers
          addAccount(account);
          updateActiveUser(account);
          this.props.pinEntry && this.props.pinEntry(pin ? entry : null);
        })
        .catch(() => {
          error(_t("g.server-error"));
        });
    } else if (ownEntry && !pin && profile && activeUser) {
      const newProfile = {
        name: profile?.name || "",
        about: profile?.about || "",
        cover_image: profile?.cover_image || "",
        profile_image: profile?.profile_image || "",
        website: profile?.website || "",
        location: profile?.location || "",
        pinned: ""
      };
      updateProfile(activeUser.data, newProfile)
        .then((r) => {
          success(_t("entry-menu.unpin-success"));
          return getAccount(name);
        })
        .then((account) => {
          // update reducers
          addAccount(account);
          updateActiveUser(account);
          this.props.pinEntry && this.props.pinEntry(pin ? entry : null);
        })
        .catch(() => {
          error(_t("g.server-error"));
        });
    }
  };

  toggleLoginModal = () => {
    this.props.toggleUIProp("login");
  };

  render() {
    const {
      global,
      activeUser,
      entry,
      entryPinTracker,
      alignBottom,
      separatedSharing,
      extraMenuItems,
      toggleEdit
    } = this.props;

    const activeUserWithProfile = activeUser?.data as FullAccount;
    const profile = activeUserWithProfile && activeUserWithProfile.profile;
    const isComment = !!entry.parent_author;

    const ownEntry = activeUser && activeUser.username === entry.author;
    const community: any = this.getCommunity();
    const canPinToCommunity =
      community?.context?.role !== "guest" && community?.context?.role !== "member";

    // const editable = ownEntry && !isComment;
    const editable = ownEntry;
    const deletable =
      ownEntry && !(entry.children > 0 || entry.net_rshares > 0 || entry.is_paidout);

    let menuItems: MenuItem[] = [];

    if (activeUser && !isComment && isCommunity(entry.category)) {
      menuItems = [
        {
          label: _t("entry-menu.cross-post"),
          onClick: this.toggleCross,
          icon: shuffleVariantSvg
        }
      ];
    }

    if (!separatedSharing) {
      menuItems = [
        ...menuItems,
        {
          label: _t("entry-menu.share"),
          onClick: this.toggleShare,
          icon: shareVariantSvg
        }
      ];
    }

    if (global.usePrivate) {
      menuItems = [
        ...menuItems,
        {
          label: _t("entry-menu.edit-history"),
          onClick: this.toggleEditHistory,
          icon: historySvg
        }
      ];
    }

    if (editable) {
      menuItems = [
        ...menuItems,
        ...[
          {
            label: _t("g.edit"),
            // onClick: this.edit,
            onClick: isComment && toggleEdit ? toggleEdit : this.edit,
            icon: pencilOutlineSvg
          }
        ]
      ];
    }

    if (deletable) {
      menuItems = [
        ...menuItems,
        ...[
          {
            label: _t("g.delete"),
            onClick: this.toggleDelete,
            icon: deleteForeverSvg
          }
        ]
      ];
    }

    if (this.canPinBothOptions()) {
      if (
        entryPinTracker[`${entry.author}-${entry.permlink}`] &&
        entry.permlink === profile?.pinned
      ) {
        menuItems = [
          ...menuItems,
          {
            label: _t("entry-menu.unpin-from-community"),
            onClick: () => this.toggleUnpin("community"),
            icon: pinSvg
          },
          {
            label: _t("entry-menu.unpin-from-blog"),
            onClick: () => this.toggleUnpin("blog"),
            icon: pinSvg
          }
        ];
      } else if (entryPinTracker[`${entry.author}-${entry.permlink}`]) {
        menuItems = [
          ...menuItems,
          {
            label: _t("entry-menu.unpin-from-community"),
            onClick: () => this.toggleUnpin("community"),
            icon: pinSvg
          },
          {
            label: _t("entry-menu.pin-to-blog"),
            onClick: () => this.togglePin("blog"),
            icon: pinSvg
          }
        ];
      } else if (entry.permlink === profile?.pinned) {
        menuItems = [
          ...menuItems,
          {
            label: _t("entry-menu.pin-to-community"),
            onClick: () => this.togglePin("community"),
            icon: pinSvg
          },
          {
            label: _t("entry-menu.unpin-from-blog"),
            onClick: () => this.toggleUnpin("blog"),
            icon: pinSvg
          }
        ];
      } else {
        menuItems = [
          ...menuItems,
          {
            label: _t("entry-menu.pin-to-blog"),
            onClick: () => this.togglePin("blog"),
            icon: pinSvg
          },
          {
            label: _t("entry-menu.pin-to-community"),
            onClick: () => this.togglePin("community"),
            icon: pinSvg
          }
        ];
      }
    } else if (this.canPin() || activeUser) {
      if (entryPinTracker[`${entry.author}-${entry.permlink}`] && canPinToCommunity) {
        menuItems = [
          ...menuItems,
          {
            label: _t("entry-menu.unpin-from-community"),
            onClick: () => this.toggleUnpin("community"),
            icon: pinSvg
          }
        ];
      } else if (entry.permlink === profile?.pinned) {
        menuItems = [
          ...menuItems,
          {
            label: _t("entry-menu.unpin-from-blog"),
            onClick: () => this.toggleUnpin("blog"),
            icon: pinSvg
          }
        ];
      } else if (ownEntry) {
        menuItems = [
          ...menuItems,
          {
            label: _t("entry-menu.pin-to-blog"),
            onClick: () => this.togglePin("blog"),
            icon: pinSvg
          }
        ];
      } else if (isCommunity(entry.category) && canPinToCommunity) {
        menuItems = [
          ...menuItems,
          {
            label: _t("entry-menu.pin-to-community"),
            onClick: () => this.togglePin("community"),
            icon: pinSvg
          }
        ];
      }
    }

    if (this.canMute()) {
      const isMuted = !!entry.stats?.gray;
      menuItems = [
        ...menuItems,
        ...[
          {
            label: isMuted ? _t("entry-menu.unmute") : _t("entry-menu.mute"),
            onClick: this.toggleMute,
            icon: volumeOffSvg
          }
        ]
      ];
    }

    if (global.usePrivate) {
      menuItems = [
        ...menuItems,
        ...[
          {
            label: _t("entry-menu.promote"),
            onClick: activeUser !== null ? this.togglePromote : this.toggleLoginModal,
            icon: bullHornSvg
          },
          {
            label: _t("entry-menu.boost"),
            onClick: activeUser !== null ? this.toggleBoost : this.toggleLoginModal,
            icon: rocketLaunchSvg
          }
        ]
      ];
    }

    menuItems = [
      ...menuItems,
      {
        label: _t("entry.address-copy"),
        onClick: this.copyAddress,
        icon: linkVariantSvg
      }
    ];

    if (extraMenuItems) {
      menuItems = [...menuItems, ...extraMenuItems];
    }

    if (menuItems) {
      let deleteItems = menuItems.filter((item) => item.label === _t("g.delete"));
      if (deleteItems.length === 1) {
        let items = menuItems.filter((item) => item.label !== "");
        menuItems = items;
      }
      let updatedItems: MenuItem[] = [];
      menuItems.forEach((item) => {
        if (
          item.label === _t("entry-menu.promote") ||
          item.label === _t("entry-menu.boost") ||
          item.label === _t("entry-menu.pin") ||
          item.label === _t("entry-menu.unpin")
        ) {
          updatedItems.unshift(item);
        } else {
          updatedItems.push(item);
        }
      });
      menuItems = updatedItems;
    }

    const menuConfig = {
      history: this.props.history,
      label: "",
      icon: dotsHorizontal,
      items: menuItems
    };

    const { cross, share, editHistory, delete_, pin, unpin, mute, promote, boost } = this.state;
    // const community = this.getCommunity();

    return (
      <div className="entry-menu">
        {separatedSharing && (
          <div className="separated-share">
            <div className="share-button single-button" onClick={this.toggleShare}>
              {shareVariantSvg}
            </div>
            <div className="all-buttons">
              <div
                className="share-button"
                onClick={() => {
                  shareReddit(entry);
                }}
              >
                {redditSvg}
              </div>
              <div
                className="share-button"
                onClick={() => {
                  shareTwitter(entry);
                }}
              >
                {twitterSvg}
              </div>
              <div
                className="share-button share-button-facebook"
                onClick={() => {
                  shareFacebook(entry);
                }}
              >
                {facebookSvg}
              </div>
            </div>
          </div>
        )}

        <DropDown {...menuConfig} float="right" alignBottom={alignBottom} />
        {activeUser && cross && (
          <CrossPost
            entry={entry}
            activeUser={activeUser}
            onHide={this.toggleCross}
            onSuccess={(community) => {
              this.toggleCross();

              const { history } = this.props;
              history.push(`/created/${community}`);
            }}
          />
        )}
        {share && <EntryShare entry={entry} onHide={this.toggleShare} />}
        {editHistory && <EditHistory entry={entry} onHide={this.toggleEditHistory} />}
        {delete_ && (
          <ModalConfirm
            onConfirm={() => {
              this.delete();
              this.toggleDelete();
            }}
            onCancel={this.toggleDelete}
          />
        )}
        {pin && (
          <ModalConfirm
            onConfirm={() => {
              if (this.state.pinKey === "community") {
                this.pinToCommunity(true);
              } else if (this.state.pinKey === "blog") {
                this.pinToBlog(true);
              }
              // this.pin(true);
              this.togglePin();
            }}
            onCancel={this.togglePin}
          />
        )}
        {unpin && (
          <ModalConfirm
            onConfirm={() => {
              if (this.state.pinKey === "community") {
                this.pinToCommunity(false);
              } else if (this.state.pinKey === "blog") {
                this.pinToBlog(false);
              }
              // this.pin(false);
              this.toggleUnpin();
            }}
            onCancel={this.toggleUnpin}
          />
        )}
        {community &&
          activeUser &&
          mute &&
          MuteBtn({
            community,
            entry,
            activeUser: activeUser,
            onlyDialog: true,
            onSuccess: (entry, mute) => {
              const { updateEntry } = this.props;
              updateEntry(entry);
              this.toggleMute();

              if (pin) {
                success(_t("entry-menu.mute-success"));
              } else {
                success(_t("entry-menu.unmute-success"));
              }
            },
            onCancel: this.toggleMute
          })}
        {activeUser && promote && (
          <Promote
            {...this.props}
            activeUser={activeUser}
            entry={entry}
            onHide={this.togglePromote}
          />
        )}
        {activeUser && boost && (
          <Boost {...this.props} activeUser={activeUser} entry={entry} onHide={this.toggleBoost} />
        )}
      </div>
    );
  }
}

export default (
  p: Pick<
    Props,
    | "entry"
    | "history"
    | "separatedSharing"
    | "alignBottom"
    | "extraMenuItems"
    | "toggleEdit"
    | "pinEntry"
  >
) => {
  const {
    global,
    activeUser,
    communities,
    entryPinTracker,
    dynamicProps,
    signingKey,
    setSigningKey,
    addAccount,
    updateActiveUser,
    updateEntry,
    addCommunity,
    trackEntryPin,
    setEntryPin,
    toggleUIProp
  } = useMappedStore();

  const props: Props = {
    history: p.history,
    global,
    dynamicProps,
    activeUser,
    entry: p.entry,
    communities,
    entryPinTracker,
    separatedSharing: p.separatedSharing,
    alignBottom: p.alignBottom,
    signingKey,
    extraMenuItems: p.extraMenuItems,
    setSigningKey,
    addAccount,
    updateActiveUser,
    updateEntry,
    addCommunity,
    trackEntryPin,
    setEntryPin,
    toggleUIProp,
    toggleEdit: p.toggleEdit,
    pinEntry: p.pinEntry
  };

  return <EntryMenu {...props} />;
};
