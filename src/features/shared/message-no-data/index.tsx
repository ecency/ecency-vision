import React from "react";
import "./_index.scss";
import { Button } from "@ui/button";
import Image from "next/image";
import Link from "next/link";

interface Props {
  buttonTo: string;
  buttonText: string;
  title: string;
  description: string;
  img?: any;
}

export function MessageNoData({ buttonText, buttonTo, title, description, img }: Props) {
  return (
    <div className="rounded-2xl grid grid-cols-4 gap-4 max-w-[640px] mx-auto border border-[--border-color] p-4 justify-center items-center my-4 md:my-8 xl:my-12">
      <div className="col-span-1">
        <Image
          width={400}
          height={400}
          src={img || "/assets/writer.png"}
          alt=""
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col gap-4 col-span-3">
        <h2>{title}</h2>
        <p className="text-gray-600 lead">{description}</p>
        <div>
          {buttonText && (
            <Link href={buttonTo}>
              <Button>{buttonText}</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
