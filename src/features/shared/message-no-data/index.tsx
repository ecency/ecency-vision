import React from "react";
import "./_index.scss";
import { Button } from "@ui/button";
import Link from "next/link";
import Image from "next/image";

interface Props {
  buttonTo: string;
  buttonText: string;
  title: string;
  description: string;
  img?: any;
}

export function MessageNoData({ buttonText, buttonTo, title, description, img }: Props) {
  return (
    <div className="flex justify-center items-center mt-5">
      <div className="w-[25%]">
        <Image
          width={400}
          height={400}
          src={img || "/assets/img/writer.png"}
          alt=""
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col w-[50%] ml-5">
        <h2>{title}</h2>
        <p className="text-gray-600 lead">{description}</p>
        {buttonText && (
          <Link href={buttonTo}>
            <Button className="align-self-baseline">{buttonText}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
