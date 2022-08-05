import React from 'react';
import './insufficient-resource-credits-details.scss';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { ActiveUser } from '../../store/active-user/types';

interface Props {
  activeUser: ActiveUser | null;
}

export const InsufficientResourceCreditsDetails = ({ activeUser }: Props) => {
  return <div className="insufficient-resource-credits-details">
    <p className="mb-4">Your options to get more Resource credits</p>
    <ListGroup>
      <ListGroupItem action={true} onClick={() => window.open(`/purchase?username=${activeUser?.username}&type=boost`, '_blank')}>
        Purchase account boost (get delegation)
      </ListGroupItem>
      <ListGroupItem action={true} onClick={() => window.open('/faq#what-powering-up', '_blank')}>
        Buy HIVE and Power up or stake that HIVE
      </ListGroupItem>
      <ListGroupItem action={true} onClick={() => window.open('/faq#what-are-rc', '_blank')}>
        Wait few hours until resource credits refills
      </ListGroupItem>
    </ListGroup>
  </div>
}