import React from "react";
import { ErrorFeedbackObject } from "../feedback";

interface Props {
  instance: ErrorFeedbackObject;
}

export const CommonDetails = ({ instance }: Props) => {
  return (
    <div>
      <p>{instance.id}</p>
      <p>{instance.message}</p>
    </div>
  );
};
