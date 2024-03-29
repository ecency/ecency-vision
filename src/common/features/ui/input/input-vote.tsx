import { Input } from "@ui/input/form-controls/input";
import React, { MouseEvent, PropsWithChildren, TouchEvent, useRef, useState } from "react";
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
  const mouseDownInitiatedRef = useRef(false);

  const [startPosition, setStartPosition] = useState(0);
  const [originalValue, setOriginalValue] = useState(0);

  const onTouchMove = (e: TouchEvent) => {
    const touch = e.touches.item(0);
    if (touch) {
      const diff = Math.max(-200, Math.min(200, touch.clientX - startPosition));
      setValue(Math.min(100, Math.max(0, originalValue + diff)));
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (mouseDownInitiatedRef.current) {
      const diff = Math.max(-200, Math.min(200, e.clientX - startPosition));
      setValue(Math.min(100, Math.max(0, originalValue + diff)));
    }
  };

  return (
    <div
      className="ecency-vote-input rounded-full overflow-hidden relative"
      onTouchStart={(e) => {
        setStartPosition(e.touches.item(0)?.clientX);
        setOriginalValue(value);
      }}
      onTouchMove={onTouchMove}
      onMouseDown={(e) => {
        mouseDownInitiatedRef.current = true;
        setStartPosition(e.clientX);
        setOriginalValue(value);
      }}
      onMouseMove={onMouseMove}
      onMouseUp={(e) => (mouseDownInitiatedRef.current = false)}
    >
      <InputGroup append="%" className="relative z-10">
        <Input type="number" step="0.1" value={value} onChange={(e) => setValue(+e.target.value)} />
      </InputGroup>

      <div
        className="absolute bg-blue-dark-sky bg-opacity-25 top-[1px] left-[1px] bottom-[1px]"
        style={{
          width: `${value * 0.86}%`
        }}
      />

      <div className="absolute z-[11] right-10 top-0 bottom-0 flex flex-col justify-center items-center">
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
