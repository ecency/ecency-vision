import React from 'react';
import './insufficient-resource-credits-details.scss';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { ActiveUser } from '../../store/active-user/types';
import { _t } from '../../i18n';

interface Props {
  activeUser: ActiveUser | null;
}

export const InsufficientResourceCreditsDetails = ({ activeUser }: Props) => {
  return <div className="insufficient-resource-credits-details">
    <p className="mb-4">Your options to get more Resource credits</p>
    <ListGroup>
      <ListGroupItem action={true} onClick={() => window.open(`/purchase?username=${activeUser?.username}&type=boost`, '_blank')}>
        {_t('feedback-modal.insufficient-resource-credits-details.purchase')}
      </ListGroupItem>
      <ListGroupItem action={true} onClick={() => window.open('/faq#what-powering-up', '_blank')}>
        {_t('feedback-modal.insufficient-resource-credits-details.buy-hive')}
      </ListGroupItem>
      <ListGroupItem action={true} onClick={() => window.open('/faq#what-are-rc', '_blank')}>
        {_t('feedback-modal.insufficient-resource-credits-details.wait')}
      </ListGroupItem>
    </ListGroup>
  </div>
}