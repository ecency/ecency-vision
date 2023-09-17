import { _t } from "../../../i18n";
import { checkSvg } from "../../../img/svg";
import React, { ChangeEvent, useEffect, useState } from "react";
import { DeckHeaderSettingsItem } from "./deck-header-settings-item";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";

interface Props {
  updateInterval: number;
  username: string;
  title: string;
  setDeckUpdateInterval: Function;
}

export const DeckHeaderUpdateIntervalSettings = ({
  updateInterval,
  title,
  username,
  setDeckUpdateInterval
}: Props) => {
  const [deckUpdateOptions, setDeckUpdateOptions] = useState([
    { label: _t("decks.update-n-seconds", { sec: 30 }), value: 30000 },
    { label: _t("decks.update-n-minutes", { min: 1 }), value: 60000 },
    { label: _t("decks.update-n-minutes", { min: 5 }), value: 300000 },
    { label: _t("decks.update-n-minutes", { min: 10 }), value: 600000 },
    { label: _t("decks.update-n-minutes", { min: 15 }), value: 900000 },
    { label: _t("decks.update-n-minutes", { min: 30 }), value: 1800000 },
    { label: _t("decks.update-n-hours", { hour: 1 }), value: 3600000 },
    { label: _t("decks.update-custom"), value: "custom" }
  ]);
  const [inputValue, setInputValue] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSelectChange = (event: ChangeEvent<any>) => {
    saveInterval(event.target.value);
  };
  const saveInterval = (value: string) => {
    setErrorMessage("");
    if (isNaN(+value)) {
      setShowInput(true);
    } else if (+value >= 30000 && +value <= 86400000) {
      setDeckUpdateInterval(+value);
    } else {
      setErrorMessage(_t("decks.update-interval-value-error"));
    }
  };

  useEffect(() => {
    if (updateInterval !== inputValue) {
      setInputValue(updateInterval / 1000 / 60);
    }
  }, [updateInterval]);

  const getSubmitButton = () => {
    if (updateInterval !== inputValue * 1000 * 60) {
      return (
        <Button
          appearance="link"
          size="sm"
          onClick={() => saveInterval(`${inputValue * 1000 * 60}`)}
          icon={checkSvg}
        />
      );
    }
    return <></>;
  };

  const getControl = () => {
    const isPreDefinedValue = deckUpdateOptions.some(({ value }) => updateInterval === value);
    if (isPreDefinedValue && !showInput) {
      return (
        <FormControl
          type="select"
          placeholder={_t("decks.update-interval-placeholder")}
          value={updateInterval}
          onChange={onSelectChange}
        >
          {deckUpdateOptions.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </FormControl>
      );
    } else {
      return (
        <div className="flex w-full">
          <FormControl
            type="number"
            placeholder={_t("deck.update-custom-interval-in-minutes-placeholder")}
            value={inputValue}
            onChange={(event) => setInputValue(+event.target.value)}
          />
          {getSubmitButton()}
        </div>
      );
    }
  };

  return (
    <DeckHeaderSettingsItem title={_t("decks.settings")} hasBorderBottom={false}>
      <div className="flex items-center w-full pb-2">
        <small className="label mr-3">
          {showInput ? _t("decks.update-interval-min") : _t("decks.update-interval")}
        </small>
        <div className="w-100">
          {getControl()}
          {errorMessage ? <div className="text-danger mt-2">{errorMessage}</div> : <></>}
        </div>
      </div>
    </DeckHeaderSettingsItem>
  );
};
