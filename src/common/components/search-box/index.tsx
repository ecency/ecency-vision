import React, { Component } from "react";
import { _t } from "../../i18n";
import { copyContent } from "../../img/svg";
import { success } from "../feedback";
import "./_index.scss";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { searchIconSvg } from "../../features/decks/icons";

type Props = any;

export default class SearchBox extends Component<Props> {
  copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(_t("profile-info.link-copied"));
  };

  render() {
    const { showcopybutton, value, username, filter, ...other } = this.props;
    return (
      <div className="search-box">
        {showcopybutton ? (
          <div className="flex focus-input">
            <InputGroup
              append={
                <Button
                  disabled={value.length === 0}
                  onClick={() =>
                    this.copyToClipboard(`https://ecency.com/${username}/${filter}?q=${value}`)
                  }
                >
                  <div className="w-4 flex">{copyContent}</div>
                </Button>
              }
            >
              <FormControl
                type="text"
                {...{ ...other, value, username, filter }}
                className={"input-with-copy rounded-r"}
              />
            </InputGroup>
          </div>
        ) : (
          <InputGroup prepend={searchIconSvg}>
            <FormControl type="text" {...{ ...other, value, username, filter }} />
          </InputGroup>
        )}
      </div>
    );
  }
}
