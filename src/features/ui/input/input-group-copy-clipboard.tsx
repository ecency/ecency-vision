import { InputGroup } from "./input-group";
import React, { HTMLAttributes } from "react";
import useCopyToClipboard from "react-use/lib/useCopyToClipboard";
import { FormControl } from "./form-controls";
import { Button } from "@ui/button";
import { copyContent } from "@/features/ui/svg";

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
          className="copy-to-clipboard"
          onClick={() => copy(props.value)}
          icon={copyContent}
        />
      }
      onClick={() => copy(props.value)}
    >
      <FormControl
        type="text"
        value={props.visibleValue ?? props.value}
        disabled={props.editable ?? true}
        className="text-blue-dark-sky pointer"
        onChange={props.onChange}
      />
    </InputGroup>
  );
}
