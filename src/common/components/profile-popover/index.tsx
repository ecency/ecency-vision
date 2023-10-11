import React, { useState } from "react";
import { Manager, Popper, Reference } from "react-popper";
import { ProfilePreview } from "../profile-preview";
import { menuDownSvg } from "../../img/svg";
import "./index.scss";
import { Entry } from "../../store/entries/types";
import { useMappedStore } from "../../store/use-mapped-store";

export const ProfilePopover = ({ entry }: { entry: Entry }) => {
  const { global } = useMappedStore();

  const [showProfile, setShowProfile] = useState(false);
  const [delayHandler, setDelayHandler] = useState<any>(null);
  const author = entry.original_entry ? entry.original_entry.author : entry.author;

  const handleShowProfile = (e: any) => {
    e.persist();
    // Add 0.5 sec delay while showing mini-profile to avoid many profiles at a time
    const timeout = setTimeout(
      () => {
        e.stopPropagation();
        if (global.isMobile && e.type == "click") {
        }
        setShowProfile(true);
        document.getElementsByTagName("body")[0].classList.add("overflow-sm-hidden");
      },
      global.isMobile ? 0 : 600
    );
    setDelayHandler(timeout);
  };

  const handleHideProfile = (e: any, doNotSetState?: boolean) => {
    clearTimeout(delayHandler);
    e.stopPropagation();
    // Add 0.2 sec delay while hiding mini-profile on web
    setTimeout(
      () => {
        !doNotSetState && setShowProfile(false);
        document.getElementsByTagName("body")[0].classList.remove("overflow-sm-hidden");
      },
      global.isMobile ? 0 : 200
    );
  };

  return (
    <>
      <div
        className="author btn notranslate flex sm:hidden items-center"
        onClick={handleShowProfile}
        id={`${author}-${entry.permlink}`}
      >
        <span className="author-name">{author}</span>
      </div>

      <span
        className="author-down-arrow mx-1"
        role="button"
        onClick={handleShowProfile}
        id={`${author}-${entry.permlink}`}
      >
        {menuDownSvg}
      </span>

      <Manager>
        <div onMouseLeave={handleHideProfile}>
          <Reference>
            {({ ref }) => (
              <div
                ref={ref}
                className="author btn notranslate hidden sm:flex items-center relative"
                onMouseEnter={handleShowProfile}
              >
                <span className="author-name">{author}</span>
              </div>
            )}
          </Reference>
          {showProfile && author && (
            <Popper
              placement="bottom-start"
              modifiers={[
                {
                  name: "offset",
                  options: {
                    offset: () => [0, window.matchMedia("(max-width: 576px)").matches ? 0 : -30]
                  }
                }
              ]}
            >
              {({ ref, style, placement, arrowProps }) => (
                <div
                  ref={ref}
                  style={{ ...style }}
                  className="popper-container"
                  data-placement={placement}
                  onMouseLeave={handleHideProfile}
                >
                  <ProfilePreview
                    username={author}
                    onClose={(e, doNotSetState) => handleHideProfile(e, doNotSetState)}
                  />
                </div>
              )}
            </Popper>
          )}
        </div>
      </Manager>
    </>
  );
};
