import React, { ChangeEvent, useContext } from "react";
import { _t } from "../../../../i18n";
import { Form } from "react-bootstrap";
import { DeckHeaderSettingsItem } from "../../header/deck-header-settings-item";
import { COMMUNITY_CONTENT_TYPES } from "../../consts";
import { CommunityDeckGridItem } from "../../types";
import { DeckGridContext } from "../../deck-manager";

interface Props {
  id: string;
  settings: CommunityDeckGridItem["settings"];
}

export const DeckCommunityColumnSettings = ({ id, settings }: Props) => {
  const { updateColumnSpecificSettings } = useContext(DeckGridContext);

  const onSelectChange = (event: ChangeEvent<any>) => {
    const nextContentType = event.target.value;
    updateColumnSpecificSettings(id, { contentType: nextContentType });
  };

  return (
    <DeckHeaderSettingsItem title={_t("decks.content-type")} hasBorderBottom={false}>
      <div className="d-flex align-items-center w-100 pb-2">
        <Form.Text className="label mr-3">{_t("decks.content-type")}</Form.Text>
        <div className="w-100">
          <Form.Control
            as={"select"}
            size="sm"
            placeholder={_t("decks.update-interval-placeholder")}
            value={settings.contentType}
            onChange={onSelectChange}
          >
            {COMMUNITY_CONTENT_TYPES.map(({ title, type }) => (
              <option key={type} value={type}>
                {title}
              </option>
            ))}
          </Form.Control>
        </div>
      </div>
    </DeckHeaderSettingsItem>
  );
};
