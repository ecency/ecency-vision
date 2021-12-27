import React, { Component } from "react";

import { Button, FormControl, InputGroup } from "react-bootstrap";
import { _t } from "../../i18n";

import { copyContent, magnifySvg } from "../../img/svg";

type Props = any;

export default class SearchBox extends Component<Props> {
  render() {
    const {showCopyButton} = this.props
    return (<div className="search-box">
      {showCopyButton ? 
      <InputGroup
          className="mb-3 w-75"
      >
          <FormControl type="text" {...this.props} className={"input-with-copy"}/>
          <InputGroup.Append>
              <Button
                  variant="primary"
                  size="sm"
                  className="copy-to-clipboard"
                  // disabled={search.length === 0}
                  // onClick={() => {this.copyToClipboard(`http://localhost:3000/faq?q=${search}&lang=${global.lang.split("-")[0]}`);}}
              >
                  {copyContent}
              </Button>
          </InputGroup.Append>
      </InputGroup> : <>
      <span className="prepend">{magnifySvg}</span>
        <FormControl type="text" {...this.props} /></>}
      </div> )
  }
}
