import React, { ChangeEvent, useContext } from "react";
import { _t } from "../../../../i18n";
import { DeckHeaderSettingsItem } from "../../header/deck-header-settings-item";
import { UserDeckGridItem } from "../../types";
import { DeckGridContext } from "../../deck-manager";
import { FormControl } from "@ui/input";

interface Props {
  id: string;
  title?: string;
  settings: UserDeckGridItem["settings"];
  contentTypes: any[];
}

export const DeckContentTypeColumnSettings = ({
  id,
  title = _t("decks.content-type"),
  settings,
  contentTypes
}: Props) => {
  const { updateColumnSpecificSettings } = useContext(DeckGridContext);

  const onSelectChange = (event: ChangeEvent<any>) => {
    const nextContentType = event.target.value;
    updateColumnSpecificSettings(id, { contentType: nextContentType });
  };

  return (
    <DeckHeaderSettingsItem title={title} hasBorderBottom={false}>
      <div className="flex items-center w-full pb-2">
        <small className="label mr-3">{title}</small>
        <div className="w-full">
          <FormControl type="select" value={settings.contentType} onChange={onSelectChange}>
            {contentTypes.map(({ title, type }) => (
              <option key={type} value={type}>
                {title}
              </option>
            ))}
          </FormControl>
        </div>
      </div>
    </DeckHeaderSettingsItem>
  );
};
