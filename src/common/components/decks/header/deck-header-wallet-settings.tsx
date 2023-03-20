import React, { ChangeEvent } from "react";
import { _t } from "../../../i18n";
import { DeckHeaderSettingsItem } from "./deck-header-settings-item";
import { Form } from "react-bootstrap";
import { IdentifiableDeckModel } from "../../../store/deck/types";

export interface Props {
  title: string;
  username: string;
  setDeckDataFilters: Function;
  fetchDeckData: Function;
  deck: IdentifiableDeckModel;
}

export const DeckHeaderWalletSettings = ({
  title,
  username,
  setDeckDataFilters,
  deck,
  fetchDeckData
}: Props) => {
  const typeChanged = (event: ChangeEvent<typeof Form.Control & HTMLInputElement>) => {
    setDeckDataFilters({ title, username, dataFilters: { group: event.target.value } });
    fetchDeckData(title);
  };

  return (
    <DeckHeaderSettingsItem title={_t("decks.filters")} hasBorderBottom={true}>
      <div className="d-flex align-items-center w-100 pb-2">
        <Form.Text className="label mr-3">{_t("decks.history")}</Form.Text>
        <Form.Control as="select" value={deck.dataFilters.group} onChange={typeChanged} size="sm">
          <option value="">{_t("transactions.group-all")}</option>
          {["transfers", "market-orders", "interests", "stake-operations", "rewards"].map((x) => (
            <option key={x} value={x}>
              {_t(`transactions.group-${x}`)}
            </option>
          ))}
        </Form.Control>
      </div>
    </DeckHeaderSettingsItem>
  );
};
