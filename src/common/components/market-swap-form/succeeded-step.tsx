import React from "react";
import { Button } from "react-bootstrap";

interface Props {
  onReset: () => void;
}

export const SucceededStep = ({ onReset }: Props) => {
  return (
    <div className="text-center mt-4">
      <Button variant="primary py-3 px-5 mt-4" onClick={() => onReset()}>
        Start new one
      </Button>
    </div>
  );
};
