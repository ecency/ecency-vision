import React, { useEffect, useState } from "react";
import { FormControl } from "@ui/input/form-controls";

interface Props {
  codeSize?: number;
  value: string;
  setValue: (v: string) => void;
  disabled?: boolean;
}

export function CodeInput({ value, setValue, codeSize = 6, disabled }: Props) {
  const [code, setCode] = useState(new Array(codeSize).fill(""));

  useEffect(() => {
    setValue(code.join(""));
  }, [code]);

  useEffect(() => {
    const nextCode = value.split("");
    setCode(
      new Array(codeSize).fill("").map((_, i) => {
        if (nextCode[i]) {
          return nextCode[i];
        }
        return "";
      })
    );
  }, [value]);

  return (
    <div className="flex py-6 [&>input]:w-[36px] [&>input]:h-[36px] gap-2 justify-center [&>input]:text-center">
      {code.map((item, i) => (
        <FormControl
          disabled={disabled}
          id={`code-input-${i}`}
          key={i}
          type="text"
          value={item}
          onKeyUp={(e) => {
            if (e.key === "Backspace") {
              const nextElement = document.querySelector(
                `#code-input-${i - 1}`
              ) as HTMLInputElement | null;
              if (nextElement) {
                nextElement.focus();
              }
            }
          }}
          onChange={(e) => {
            const lastCharacter =
              e.target.value.length > 0 ? e.target.value[e.target.value.length - 1] : "";
            const tempCode = [...code];
            tempCode[i] = lastCharacter;
            setCode(tempCode);

            const nextElement = document.querySelector(
              `#code-input-${i + 1}`
            ) as HTMLInputElement | null;
            if (nextElement && lastCharacter) {
              nextElement.focus();
            }
          }}
        />
      ))}
    </div>
  );
}
