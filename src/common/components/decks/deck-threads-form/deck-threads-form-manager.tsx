import React, { createContext, useState } from "react";

interface Context {
  show: boolean;
  setShow: (v: boolean) => void;
}

export const DeckThreadsFormContext = createContext<Context>({
  show: false,
  setShow: () => {}
});

interface Props {
  children: (context: Context) => JSX.Element | JSX.Element[];
}

export const DeckThreadsFormManager = ({ children }: Props) => {
  const [show, setShow] = useState(false);

  return (
    <DeckThreadsFormContext.Provider value={{ show, setShow }}>
      {children({ show, setShow })}
    </DeckThreadsFormContext.Provider>
  );
};
