import { Input } from "@ui/input/form-controls/input";
import React, { PropsWithChildren, useState } from "react";
import { UilArrowDown, UilArrowUp } from "@iconscout/react-unicons";
import "./_input-vote.scss";
import { InputGroup } from "@ui/input/input-group";
import useInterval from "react-use/lib/useInterval";

interface Props {
  value: number;
  setValue: (v: number) => void;
}

function ArrowButton({ children, onClick }: PropsWithChildren<{ onClick: () => void }>) {
  const [fireInterval, setFireInterval] = useState(false);

  useInterval(() => onClick(), fireInterval ? 300 : null);

  return (
    <div
      className="cursor-pointer h-4 flex items-center text-blue-dark-sky opacity-75 hover:opacity-100"
      onClick={() => {
        setFireInterval(false);
        onClick();
      }}
      onMouseDown={() => setFireInterval(true)}
    >
      {children}
    </div>
  );
}

export function InputVote({ value, setValue }: Props) {
  return (
    <div className="ecency-vote-input relative">
      <InputGroup append="%">
        <Input type="number" step="0.1" value={value} onChange={(e) => setValue(+e.target.value)} />
      </InputGroup>
      <div className="absolute right-10 top-0 bottom-0 flex flex-col justify-center items-center">
        <ArrowButton onClick={() => setValue(value + 0.1)}>
          <UilArrowUp />
        </ArrowButton>
        <ArrowButton onClick={() => setValue(value - 0.1)}>
          <UilArrowDown />
        </ArrowButton>
      </div>
    </div>
  );
}
