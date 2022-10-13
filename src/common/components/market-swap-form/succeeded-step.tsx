import React from "react";
import { Button } from "react-bootstrap";

export const SucceededStep = () => {
  return (
    <div className="text-center mt-4">
      <div className="text-primary success-message">
        You transaction was successfully completed!
      </div>
      <Button variant="primary py-3 px-5 mt-4">Start new one</Button>
    </div>
  );
};
