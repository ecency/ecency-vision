import React, { useEffect, useRef } from "react";
import { _t } from "../../i18n";
import "./_index.scss";
import { closeSvg } from "../../img/svg";
import { Button } from "@ui/button";

export interface Props {
  title: string;
  description: React.ReactNode;
  media: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  placement?: string;
  showFinish?: boolean;
}

export const Introduction = ({
  title,
  description,
  media,
  onClose,
  onPrevious,
  onNext,
  placement,
  showFinish
}: Props) => {
  const prevButton = useRef(null);

  useEffect(() => {
    let body = document.getElementsByTagName("body")[0];
    body.classList.add("overflow-hidden");
    return () => {
      body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <>
      <div
        className="intro-popup p-4 lg:p-0"
        style={{ left: placement, top: placement ? 200 : 100 }}
      >
        <div className="container h-full">
          <button type="button" className="absolute close-btn" onClick={onClose} id="close-btn">
            {closeSvg}
          </button>
          <div className="grid grid-cols-12 gap-4 h-full items-center mt-4 md:mt-0">
            <div className="col-span-12 md:col-start-3 md:col-span-3 p-0 md:px-3">
              <img width="100%" src={media} className="media-intro" id="media" />
            </div>
            <div className="col-span-12 md:col-span-5 p-0 md:px-3">
              <div className="text-4xl mb-2 md:mb-4 text-dark font-bold">{title}</div>
              <p className="text-gray-600 paragraph mt-2 md:mt-0" id="description">
                {description}
              </p>
              <div className="flex flex-col md:flex-row">
                {onPrevious && (
                  <Button
                    ref={prevButton}
                    size="lg"
                    outline={true}
                    className="mr-0 md:mr-3 w-full md:w-[50%] intro-btn mb-3 md:mb-0"
                    onClick={() => {
                      onPrevious();
                    }}
                  >
                    {_t("g.previous")}
                  </Button>
                )}
                {onNext && (
                  <Button
                    size="lg"
                    className="w-full md:w-[50%] intro-btn"
                    onClick={() => {
                      onNext();
                    }}
                  >
                    {_t(showFinish ? "g.finish" : "g.next")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
