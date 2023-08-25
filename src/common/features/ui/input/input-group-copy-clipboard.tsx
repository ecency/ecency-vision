import { Button } from "react-bootstrap";
import { copyContent } from "../../../img/svg";
import { InputGroup } from "./input-group";
import React, { HTMLAttributes } from "react";
import useCopyToClipboard from "react-use/lib/useCopyToClipboard";
import { FormControl } from "./form-controls";

interface Props {
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  visibleValue?: string;
}

export function InputGroupCopyClipboard(props: Props & HTMLAttributes<HTMLElement>) {
  const [state, copy] = useCopyToClipboard();

  return (
    <InputGroup
      {...props}
      append={
        <Button
          variant="primary"
          size="sm"
          className="copy-to-clipboard"
          onClick={() => copy(props.value)}
        >
          {copyContent}
        </Button>
      }
      onClick={() => copy(props.value)}
    >
      <FormControl
        type="text"
        value={props.visibleValue ?? props.value}
        disabled={props.editable ?? true}
        className="text-primary pointer"
        onChange={props.onChange}
      />
    </InputGroup>
  );
}
