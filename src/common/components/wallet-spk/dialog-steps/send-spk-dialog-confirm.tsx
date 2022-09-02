import { _t } from '../../../i18n';
import { arrowRightSvg } from '../../../img/svg';
import { Button } from 'react-bootstrap';
import React from 'react';
import UserAvatar from '../../user-avatar';
import { ActiveUser } from '../../../store/active-user/types';
import { Global } from '../../../store/global/types';

interface Props {
  global: Global;
  title: string;
  activeUser: ActiveUser | null;
  showTo: boolean;
  to: string;
  memo: string;
  amount: string;
  asset: string;
  inProgress: boolean;
  back: Function;
  confirm: Function;
}

export const SendSpkDialogConfirm = ({ global, title, activeUser, showTo, to, memo, amount, asset, inProgress, back, confirm }: Props) => {
  return <>
    <div className="confirmation">
      <div className="confirm-title">{_t(`transfer.${title}`)}</div>
      <div className="users">
        <div className="from-user">
          {UserAvatar({ global, username: activeUser!!.username, size: 'medium' })}
        </div>
        {showTo && (
          <>
            <div className="arrow">{arrowRightSvg}</div>
            <div className="to-user">
              {UserAvatar({ global, username: to, size: 'medium' })}
            </div>
          </>
        )}
      </div>
      <div className="amount">
        {amount} {asset}
      </div>
      {memo && <div className="memo">{memo}</div>}
    </div>
    <div className="d-flex justify-content-center">
      <Button variant="outline-secondary" disabled={inProgress} onClick={() => back()}>
        {_t('g.back')}
      </Button>
      <span className="hr-6px-btn-spacer"/>
      <Button disabled={inProgress} onClick={() => confirm()}>
        {inProgress && <span>spinner</span>}
        {_t('transfer.confirm')}
      </Button>
    </div>
  </>
}