import { Button, Form } from 'react-bootstrap';
import { _t } from '../../i18n';
import { checkSvg } from '../../img/svg';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { DeckHeaderSettingsItem } from './deck-header-settings-item';

interface Props {
  updateInterval: number;
  username: string;
  title: string;
  setDeckUpdateInterval: Function;
}

export const DeckHeaderUpdateIntervalSettings = ({ updateInterval, title, username, setDeckUpdateInterval }: Props) => {
  const [deckUpdateOptions, setDeckUpdateOptions] = useState([
    { label: _t('decks.update-30-seconds'), value: 30000 },
    { label: _t('decks.update-1-minute'), value: 60000 },
    { label: _t('decks.update-5-minutes'), value: 300000 },
    { label: _t('decks.update-10-minutes'), value: 600000 },
    { label: _t('decks.update-15-minutes'), value: 900000 },
    { label: _t('decks.update-30-minutes'), value: 1800000 },
    { label: _t('decks.update-1-hour'), value: 3600000 },
    { label: _t('decks.update-custom'), value: 'custom' },
  ]);
  const [inputValue, setInputValue] = useState(0);
  const [showInput, setShowInput] = useState(false);

  const onSelectChange = (event: ChangeEvent<any>) => {
    saveInterval(event.target.value);
  }
  const saveInterval = (value: string) => {
    if (isNaN(+value)) {
      setShowInput(true);
    } else {
      setDeckUpdateInterval({ title, updateIntervalMs: +value }, username);
    }
  };

  useEffect(() => {
    if (updateInterval !== inputValue) {
      setInputValue(updateInterval / 1000 / 60);
    }
  }, [updateInterval]);

  const getSubmitButton = () => {
    if (updateInterval !== inputValue * 1000 * 60) {
      return <Button variant="link" size="sm" onClick={() => saveInterval(`${inputValue * 1000 * 60}`)}>{checkSvg}</Button>;
    }
    return <></>
  }

  const getControl = () => {
    const isPreDefinedValue = deckUpdateOptions.some(({ value }) => updateInterval === value);
    if (isPreDefinedValue && !showInput) {
      return <Form.Control
        as={'select'}
        size="sm"
        placeholder={_t('decks.update-interval-placeholder')}
        value={updateInterval}
        onChange={onSelectChange}
      >
        {deckUpdateOptions.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
      </Form.Control>
    } else {
      return <div className="d-flex w-100">
        <Form.Control
          type="number"
          size="sm"
          placeholder={_t('deck.update-custom-interval-in-minutes-placeholder')}
          value={inputValue}
          onChange={(event) => setInputValue(+event.target.value)}
        />
        {getSubmitButton()}
      </div>
    }
  }

  return <DeckHeaderSettingsItem title={_t('deck.settings')}>
    <div className="d-flex align-items-center w-100 pb-2">
      <Form.Text className="pr-3">{_t('decks.update-interval')}</Form.Text>
      {getControl()}
    </div>
  </DeckHeaderSettingsItem>
}