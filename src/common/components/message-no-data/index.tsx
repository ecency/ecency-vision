import React from "react";
import { Link } from "react-router-dom";
import "./_index.scss";
import { Button } from "@ui/button";

interface Props {
  buttonTo: string;
  buttonText: string;
  title: string;
  description: string;
  img?: any;
  global: any;
}

const MessageNoData = ({ buttonText, buttonTo, title, description, img, global }: Props) => {
  const writer = global.isElectron ? "./img/writer.png" : require("../../img/writer.png");
  return (
    <div className="flex justify-center items-center mt-5">
      <div className="w-[25%]">
        <img src={img || writer} className="w-full h-full" />
      </div>
      <div className="flex flex-col w-[50%] ml-5">
        <h2>{title}</h2>
        <p className="text-gray-600 lead">{description}</p>
        {buttonText && (
          <Link to={buttonTo}>
            <Button className="align-self-baseline">{buttonText}</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default (p: Props) => {
  const props: Props = {
    buttonTo: p.buttonTo,
    buttonText: p.buttonText,
    title: p.title,
    description: p.description,
    img: p.img,
    global: p.global
  };

  return <MessageNoData {...props} />;
};
