import React from "react";
import "./_index.scss";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { copyContent } from "@/features/ui/svg";
import { searchIconSvg } from "@/features/ui/icons";
import { useCopyToClipboard } from "react-use";

type Props = any;

export function SearchBox({ showcopybutton, value, username, filter, ...other }: Props) {
  const [_, copy] = useCopyToClipboard();

  return (
    <div className="search-box">
      {showcopybutton ? (
        <div className="flex focus-input">
          <InputGroup
            append={
              <Button
                disabled={value.length === 0}
                onClick={() => copy(`https://ecency.com/${username}/${filter}?q=${value}`)}
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
