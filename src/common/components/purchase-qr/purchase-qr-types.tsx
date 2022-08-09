import SuggestionList from '../suggestion-list';
import { Form } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { _t } from '../../i18n';
import { PurchaseTypes } from './purchase-types';

interface Props {
  className: string;
  type: PurchaseTypes;
  setType: (value: PurchaseTypes) => void;
}

interface Item {
  type: PurchaseTypes;
  title: string;
}

export const PurchaseQrTypes = ({ type, setType, className }: Props) => {
  const [input, setInput] = useState('');
  const items: Item[] = [
    {
      type: PurchaseTypes.BOOST,
      title: _t('purchase-qr.boost'),
    },
    {
      type: PurchaseTypes.POINTS,
      title: _t('purchase-qr.points'),
    }
  ];
  useEffect(() => {
    setInput(items.find(i => i.type === type)!.title);
  }, [type]);

  useEffect(() => {
    const existing = Object.values(PurchaseTypes).find(item => item === input.toLowerCase());
    if (existing) {
      setType(existing as PurchaseTypes);
    }
  }, [input]);

  const suggestionProps = {
    renderer: (i: Item) => {
      return <span>{i.title}</span>;
    },
    onSelect: (selected: Item) => {
      setType(selected.type);
    },
    ignoreFirstInputFocus: true,
  };

  return <SuggestionList containerClassName={className} items={items} {...suggestionProps}>
    <Form.Control
      type="text"
      autoFocus={true}
      placeholder={_t('purchase-qr.select-type')}
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  </SuggestionList>
}