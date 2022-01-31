import React, { useState } from 'react'
import { Manager, Reference, Popper } from 'react-popper';
import { ProfilePreview } from '../profile-preview';
import { menuDownSvg } from "../../img/svg";

export const ProfilePopover = (props: any) => {
  const { global, entry } = props;
  const [showProfile, setShowProfile] = useState(false)
  const [delayHandler, setDelayHandler] = useState<any>(null)

  const handleShowProfile = (e: any) => {
    e.persist();
    // Add 0.5 sec delay while showing mini-profile to avoid many profiles at a time
    const timeout =
      setTimeout(() => {
        e.stopPropagation()
        if (global.isMobile && e.type == "click") {
        }
        setShowProfile(true)
        document.getElementsByTagName("body")[0].classList.add("overflow-sm-hidden")
      }, global.isMobile ? 0 : 600)
    setDelayHandler(timeout)
  }

  const handleHideProfile = (e: any, doNotSetState?: boolean) => {
    clearTimeout(delayHandler)
    e.stopPropagation()
    // Add 0.2 sec delay while hiding mini-profile on web
    setTimeout(() => {
      !doNotSetState && setShowProfile(false);
      document.getElementsByTagName("body")[0].classList.remove("overflow-sm-hidden");
    }, global.isMobile ? 0 : 200)
  }


  return (
    <>
      <div className="author btn notranslate d-flex d-sm-none align-items-center" onClick={handleShowProfile} id={`${entry.author}-${entry.permlink}`}>
        <span className='author-name'>{entry.author}</span>
      </div>

      <span
        className="author-down-arrow mx-1"
        role="button"
        onClick={handleShowProfile}
        id={`${entry.author}-${entry.permlink}`}
      >
        {menuDownSvg}
      </span>

      <Manager>
        <div onMouseLeave={handleHideProfile}>
          <Reference>
            {({ ref }) => (<div ref={ref} className="author btn notranslate d-none d-sm-flex align-items-center position-relative" onMouseEnter={handleShowProfile}>
              <span className="author-name">{entry.author}</span>
            </div>)}
          </Reference>
          {showProfile && entry.author &&
            <Popper placement="bottom-start" modifiers={[{ name: 'offset', options: { offset: () => [0, window.matchMedia('(max-width: 576px)').matches ? 0 : -30] } }]}>
              {({ ref, style, placement, arrowProps }) => (<div ref={ref} style={{ ...style }} className="popper-container" data-placement={placement}
                onMouseLeave={handleHideProfile}>
                <ProfilePreview
                  username={entry.author}
                  {...props}
                  onClose={(e, doNotSetState) => handleHideProfile(e, doNotSetState)}
                />
              </div>)}
            </Popper>
          }
        </div>
      </Manager>
    </>
  )
}