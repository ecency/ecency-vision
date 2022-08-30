import { Form, InputGroup } from 'react-bootstrap';
import { _t } from '../../i18n';
import SuggestionList from '../suggestion-list';
import React from 'react';
import userAvatar from '../user-avatar';

interface Props {
  usernameData: string[];
  usernameInput: string;
  setUsernameInput: (value: string) => void;
  isUsernameDataLoading: boolean;
  setUsername: (value: string) => void;
}

export const PurchaseQrUsername = ({ usernameData, usernameInput, setUsernameInput, isUsernameDataLoading, setUsername }: Props) => {
  const suggestionProps = {
    renderer: (i: any) => {
      return (
        <>
          {userAvatar({
            username: i.name || i,
            size: 'medium',
            global: {} as any,
          })}{' '}
          <span style={{ marginLeft: '4px' }}>{i}</span>
        </>
      );
    },
    onSelect: (selectedText: any) => {
      setUsernameInput(selectedText);
      setUsername(selectedText);
    }
  };

  return <SuggestionList items={usernameData} {...suggestionProps}>
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text>
          {isUsernameDataLoading ? (
            <div
              className="spinner-border text-primary spinner-border-sm"
              role="status"
            >
              <span className="sr-only">{_t('g.loading')}</span>
            </div>
          ) : (
            '@'
          )}
        </InputGroup.Text>
      </InputGroup.Prepend>
      <Form.Control
        type="text"
        autoFocus={true}
        placeholder=""
        value={usernameInput}
        onChange={(e) => setUsernameInput(e.target.value)}
      />
    </InputGroup>
  </SuggestionList>
}