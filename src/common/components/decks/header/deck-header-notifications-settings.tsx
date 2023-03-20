import { IdentifiableDeckModel } from "../../../store/deck/types";
import React, { ChangeEvent } from "react";
import { Form } from "react-bootstrap";
import { DeckHeaderSettingsItem } from "./deck-header-settings-item";
import { _t } from "../../../i18n";
import { NotificationFilter } from "../../../store/notifications/types";

interface Props {
  title: string;
  username: string;
  setDeckDataFilters: Function;
  fetchDeckData: Function;
  deck: IdentifiableDeckModel;
}

export const DeckHeaderNotificationsSettings = ({
  title,
  username,
  setDeckDataFilters,
  fetchDeckData,
  deck
}: Props) => {
  const typeChanged = (event: ChangeEvent<typeof Form.Control & HTMLInputElement>) => {
    setDeckDataFilters({ title, username, dataFilters: { type: event.target.value } });
    fetchDeckData(title);
  };

  return (
    <DeckHeaderSettingsItem title={_t("decks.filters")} hasBorderBottom={true}>
      <div className="d-flex align-items-center w-100 pb-2">
        <Form.Text className="label mr-3">{_t("decks.type")}</Form.Text>
        <Form.Control as="select" value={deck.dataFilters.type} onChange={typeChanged} size="sm">
          <option value="">{_t("notifications.type-all-short")}</option>
          {Object.values(NotificationFilter).map((filter) => (
            <option key={filter} value={filter}>
              {_t(`notifications.type-${filter}`)}
            </option>
          ))}
        </Form.Control>
      </div>
    </DeckHeaderSettingsItem>
  );
};
