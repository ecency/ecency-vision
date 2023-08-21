import React, { useState } from 'react';
import { _t } from '../../i18n';
import Bookmarks from '../bookmarks';
import Drafts from '../drafts';
import Fragments from '../fragments';
import Gallery from '../gallery';
import { PurchaseQrDialog } from '../purchase-qr';
import Schedules from '../schedules';
import UserAvatar from '../user-avatar';
import UserNotifications from "../notifications";
import { votingPower, downVotingPower } from '../../api/hive';
import { chevronUpSvg, rocketSvg, bellSvg, bellOffSvg } from '../../img/svg';
import WalletBadge from './wallet-badge';
import DropDown from "../dropdown";
import ToolTip from "../tooltip";
import { UserNavProps } from './types/usernav-types';

const UserNav = (props: UserNavProps) => {

  const { toggleUIProp, activeUser, history, ui, notifications, global, dynamicProps, setActiveUser } = props;
  const { unread } = notifications;

  const [gallery, setGallery] = useState(false);
  const [drafts, setDrafts] = useState(false);
  const [bookmarks, setBookmarks] = useState(false);
  const [schedules, setSchedules] = useState(false);
  const [fragments, setFragments] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);

  const   toggleLogin = () => {
    toggleUIProp("login");
  };


  const toggleDrafts = () => {
    setDrafts(!drafts);
  };

  const toggleGallery = () => {
    setGallery(!gallery);
  };

  const toggleBookmarks = () => {
    setBookmarks(!bookmarks);
  };

  const toggleSchedules = () => {
    setSchedules(!schedules);
  };

  const toggleFragments = () => {
    setFragments(!fragments);
  };

  const toggleNotifications = () => {
    toggleUIProp('notifications');
  };

  const goToSettings = () => {
    history.push(`/@${activeUser.username}/settings`);
  };

  const preDropDownElem = activeUser.data.__loaded ? (
    <div className="drop-down-menu-power">
      <div className="label">{_t('user-nav.vote-power')}</div>
      <div className="power">
        <div className="voting">
          {chevronUpSvg}
          {votingPower(activeUser.data).toFixed(0)}
          {'%'}
        </div>
        <div className="downVoting">
          {chevronUpSvg}
          {downVotingPower(activeUser.data).toFixed(0)}
          {'%'}
        </div>
      </div>
    </div>
  ) : undefined;

  const dropDownItems = [
    {
      label: _t('user-nav.profile'),
      href: `/@${activeUser.username}`,
    },
    ...(global.usePrivate
      ? [
          {
            label: _t('user-nav.drafts'),
            onClick: toggleDrafts,
          },
          {
            label: _t('user-nav.gallery'),
            onClick: toggleGallery,
          },
          {
            label: _t('user-nav.bookmarks'),
            onClick: toggleBookmarks,
          },
          {
            label: _t('user-nav.schedules'),
            onClick: toggleSchedules,
          },
          {
            label: _t('user-nav.fragments'),
            onClick: toggleFragments,
          },
        ]
      : []),
    {
      label: _t('user-nav.settings'),
      onClick: goToSettings,
    },
    {
      label: _t('g.login-as'),
      onClick: toggleLogin,
    },
    {
      label: _t('user-nav.logout'),
      onClick: () => {
        setActiveUser(null);
      },
    },
  ];

  const dropDownConfig = {
    history: props.history,
    label: <UserAvatar username={activeUser.username} size="medium" />,
    items: dropDownItems,
    preElem: preDropDownElem,
  };

  return (
    <>
      <div className="user-nav">
        {global.usePrivate && (
          <div
            onClick={() => setShowPurchaseDialog(true)}
            className="user-points cursor-pointer"
          >
            {rocketSvg}
          </div>
        )}
        <WalletBadge {...props} />

        {global.usePrivate && (
          <ToolTip content={_t('user-nav.notifications')}>
            <span className="notifications" onClick={toggleNotifications}>
              {unread > 0 && (
                <span className="notifications-badge notranslate">
                  {unread.toString().length < 3 ? unread : '...'}
                </span>
              )}
              {global.notifications ? bellSvg : bellOffSvg}
            </span>
          </ToolTip>
        )}

        <DropDown {...dropDownConfig} float="right" header={`@${activeUser.username}`} />
      </div>
      {ui.notifications && <UserNotifications {...props} />}
      {gallery && <Gallery {...props} onHide={() => setGallery(false)} />}
      {drafts && <Drafts {...props} onHide={() => setDrafts(false)} />}
      {bookmarks && <Bookmarks {...props} onHide={() => setBookmarks(false)} />}
      {schedules && <Schedules {...props} onHide={() => setSchedules(false)} />}
      {fragments && <Fragments {...props} onHide={() => setFragments(false)} />}
      <PurchaseQrDialog
        show={showPurchaseDialog}
        setShow={setShowPurchaseDialog}
        activeUser={activeUser}
        location={props.location}
      />
    </>
  );
};

export default UserNav;