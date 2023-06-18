import React, { useEffect } from "react";
import { History } from "history";
import { Entry, EntryStat } from "../../store/entries/types";
import { FullAccount } from "../../store/accounts/types";
import { clone } from "../../store/util";
import EditHistory from "../edit-history";
import EntryShare, { shareFacebook, shareReddit, shareTwitter } from "../entry-share";
import MuteBtn from "../mute-btn";
import Promote from "../promote";
import Boost from "../boost";
import ModalConfirm from "../modal-confirm";
import { error, success } from "../feedback";
import DropDown from "../dropdown";
import CrossPost from "../cross-post";
import { _t } from "../../i18n";
import { deleteComment, formatError, updateProfile } from "../../api/operations";
import { getAccount } from "../../api/hive";
import { dotsHorizontal, facebookSvg, redditSvg, shareVariantSvg, twitterSvg } from "../../img/svg";
import "./_index.scss";
import { useMappedStore } from "../../store/use-mapped-store";
import { useMenuItemsGenerator } from "./menu-items-generator";
import { useCommunityCache, useCommunityPin } from "../../core";

interface Props {
  history: History;
  entry: Entry;
  extraMenuItems?: any[];
  separatedSharing?: boolean;
  alignBottom?: boolean;
  toggleEdit?: () => void;
  pinEntry?: (entry: Entry | null) => void;
}

const EntryMenu = ({
  history,
  entry,
  separatedSharing = false,
  alignBottom,
  extraMenuItems,
  toggleEdit,
  pinEntry
}: Props) => {
  const {
    global,
    activeUser,
    dynamicProps,
    signingKey,
    setSigningKey,
    addAccount,
    updateActiveUser,
    updateEntry
  } = useMappedStore();

  const { data: community } = useCommunityCache(entry.category);
  const { mutateAsync: pinPost } = useCommunityPin(entry, community);

  const {
    menuItems,
    cross,
    setCross,
    share,
    setShare,
    editHistory,
    setEditHistory,
    delete_,
    setDelete_,
    pin,
    setPin,
    pinKey,
    setPinKey,
    unpin,
    setUnpin,
    mute,
    setMute,
    promote,
    setPromote,
    boost,
    setBoost
  } = useMenuItemsGenerator(
    entry,
    community,
    separatedSharing,
    toggleEdit,
    history,
    extraMenuItems
  );

  useEffect(() => {
    if (!activeUser) {
      return;
    }
  }, []);

  const deleteAction = () =>
    deleteComment(activeUser!.username, entry.author, entry.permlink)
      .then(() => {
        history.push("/");
      })
      .catch((e) => {
        error(...formatError(e));
      });

  const pinToCommunity = async (pin: boolean) => {
    try {
      await pinPost(pin);

      // Update the entry in store
      const nStats: EntryStat = { ...clone(entry.stats), is_pinned: pin };
      const nEntry: Entry = { ...clone(entry), stats: nStats };
      updateEntry(nEntry);

      if (pin) {
        success(_t("entry-menu.pin-success"));
      } else {
        success(_t("entry-menu.unpin-success"));
      }
    } catch (e) {
      error(...formatError(e));
    }
  };

  const pinToBlog = async (pin: boolean) => {
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

      try {
        await updateProfile(activeUser.data, newProfile);
        success(_t("entry-menu.pin-success"));

        const account = await getAccount(name);
        // update reducers
        addAccount(account);
        updateActiveUser(account);
        pinEntry?.(pin ? entry : null);
      } catch (e) {
        error(_t("g.server-error"));
      }
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
      try {
        await updateProfile(activeUser.data, newProfile);
        success(_t("entry-menu.unpin-success"));

        const account = await getAccount(name);
        // update reducers
        addAccount(account);
        updateActiveUser(account);
        pinEntry?.(pin ? entry : null);
      } catch (e) {
        error(_t("g.server-error"));
      }
    }
  };

  return (
    <div className="entry-menu">
      {separatedSharing && (
        <div className="separated-share">
          <div className="share-button single-button" onClick={() => setShare(false)}>
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

      <DropDown
        items={menuItems}
        icon={dotsHorizontal}
        label=""
        history={history}
        float="right"
        alignBottom={alignBottom}
      />
      {activeUser && cross && (
        <CrossPost
          entry={entry}
          activeUser={activeUser}
          onHide={() => setCross(false)}
          onSuccess={(community) => {
            setCross(false);
            history.push(`/created/${community}`);
          }}
        />
      )}
      {share && <EntryShare entry={entry} onHide={() => setShare(false)} />}
      {editHistory && <EditHistory entry={entry} onHide={() => setEditHistory(false)} />}
      {delete_ && (
        <ModalConfirm
          onConfirm={() => {
            deleteAction();
            setDelete_(false);
          }}
          onCancel={() => setDelete_(false)}
        />
      )}
      {pin && (
        <ModalConfirm
          onConfirm={() => {
            if (pinKey === "community") {
              pinToCommunity(true);
            } else if (pinKey === "blog") {
              pinToBlog(true);
            }
            setPin(false);
            setPinKey("");
          }}
          onCancel={() => {
            setPin(false);
            setPinKey("");
          }}
        />
      )}
      {unpin && (
        <ModalConfirm
          onConfirm={() => {
            if (pinKey === "community") {
              pinToCommunity(false);
            } else if (pinKey === "blog") {
              pinToBlog(false);
            }
            setUnpin(false);
            setPinKey("");
          }}
          onCancel={() => {
            setUnpin(false);
            setPinKey("");
          }}
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
            updateEntry(entry);
            setMute(false);

            if (pin) {
              success(_t("entry-menu.mute-success"));
            } else {
              success(_t("entry-menu.unmute-success"));
            }
          },
          onCancel: () => setMute(false)
        })}
      {activeUser && promote && (
        <Promote
          activeUser={activeUser}
          entry={entry}
          onHide={() => setPromote(false)}
          global={global}
          signingKey={signingKey}
          setSigningKey={setSigningKey}
          updateActiveUser={updateActiveUser}
        />
      )}
      {activeUser && boost && (
        <Boost
          activeUser={activeUser}
          entry={entry}
          onHide={() => setBoost(false)}
          dynamicProps={dynamicProps}
          updateActiveUser={updateActiveUser}
          signingKey={signingKey}
          setSigningKey={setSigningKey}
          global={global}
        />
      )}
    </div>
  );
};

export default EntryMenu;
