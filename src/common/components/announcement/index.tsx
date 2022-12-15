import React, { useState } from "react";
import { useEffect } from "react";
import moment from "moment";
import * as ls from "../../util/local-storage";
import { upCarouselSvg, downCarouselSvg } from "../../img/svg";
import { getAnnouncementsData } from "../../api/private-api";
import { history } from "../../store";
interface AnnouncementObject {
  id: number;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
}

interface Props {
  feedbackMounted: boolean;
}
interface LaterAnnouncementObject {
  id: number;
  dateTime: Date;
}

export const mountCheck = (status: any) => {
  const ev = new CustomEvent("mountStatus", { detail: status });
  window.dispatchEvent(ev);
};

const Announcement = () => {
  const activeUser = ls.get("active_user");

  const initialList: AnnouncementObject[] = [];
  const initialAnnouncement: AnnouncementObject[] = [];

  const [show, setShow] = useState(true);
  const [list, setList] = useState(initialList);
  const [superList, setSuperlist] = useState(initialList);
  const [bannerState, setBannerState] = useState(1);
  const [index, setIndex] = useState(0);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(initialAnnouncement);
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState("");

  useEffect(() => {
    getAnnouncements();
  }, [location]);

  history?.listen((location, action) => {
    setLocation(location.pathname);
  });

  useEffect(() => {
    getAnnouncements();
    setLocation(window.location.pathname);
  }, []);

  useEffect(() => {
    window.addEventListener("mountStatus", mountStatus);
  }, [mounted]);

  useEffect(() => {
    setCurrentAnnouncement([list[bannerState - 1]]);
  }, [superList]);

  useEffect(() => {
    if (index < list.length) {
      setCurrentAnnouncement([list[index]]);
    } else {
      setCurrentAnnouncement([list[0]]);
    }
  }, [list]);

  const mountStatus = (e: Event) => {
    const status: boolean = (e as CustomEvent).detail;
    setMounted(status);
    setTimeout(() => {
      setMounted(false);
    }, 5000);
  };

  const getAnnouncements = async () => {
    const data = await getAnnouncementsData(activeUser, 200, location);
    onAnnouncement(data);
  };

  const onAnnouncement = (detail: AnnouncementObject[]) => {
    console.log(detail);
    const dismissList: number[] = ls.get("dismiss_announcements");
    const laterList: LaterAnnouncementObject[] = ls.get("later_announcements_detail");

    var displayList: AnnouncementObject[] = [];

    for (const announcement of detail) {
      if (dismissList !== null && dismissList.includes(announcement.id)) {
        continue;
      }
      if (laterList) {
        var filteredAnnouncement: LaterAnnouncementObject[] = laterList.filter(
          (a) => a.id == announcement.id
        );

        if (filteredAnnouncement[0] !== undefined) {
          let pastDateTime = filteredAnnouncement[0].dateTime;
          const past = moment(pastDateTime);
          const now = moment(new Date());
          const duration = moment.duration(now.diff(past));
          const hours = duration.asHours();

          if (hours >= 24) {
            let i = 0;
            for (const item of laterList) {
              if (item.id === announcement.id) {
                laterList.splice(i, 1);
                i++;
              }
            }
            ls.set("later_announcements_detail", laterList);
            displayList.push(announcement);
          }
        } else {
          displayList.push(announcement);
        }
      } else {
        displayList.push(announcement);
      }
    }

    setList(displayList);
    setSuperlist(displayList);
  };

  const closeClick = () => {
    setShow(false);
  };

  const upClick = () => {
    if (bannerState < list.length) {
      setCurrentAnnouncement([list[bannerState]]);
      setBannerState(bannerState + 1);
    } else {
      setBannerState(1);
      setCurrentAnnouncement([list[0]]);
    }
  };

  const downClick = () => {
    if (bannerState > 1) {
      setCurrentAnnouncement([list[bannerState - 2]]);
      setBannerState(bannerState - 1);
    } else {
      setBannerState(list.length);
      setCurrentAnnouncement([list[list.length - 1]]);
    }
  };

  const dismissClick = () => {
    const clickedBanner = list[bannerState - 1];
    const index = list.findIndex((x) => x.id === clickedBanner.id);
    setIndex(index);
    const newList = list.filter((x) => x.id !== clickedBanner.id);
    setList(newList);
    const data = ls.get("dismiss_announcements");
    if (data === null) {
      ls.set("dismiss_announcements", [list[bannerState - 1].id]);
    } else {
      const getCurrentData = ls.get("dismiss_announcements");
      for (let i = 0; i < getCurrentData.length; i++) {
        if (getCurrentData[i].id === list[bannerState - 1].id) {
          return;
        }
      }
      getCurrentData.push(list[bannerState - 1].id);
      ls.set("dismiss_announcements", getCurrentData);
    }
  };

  const laterClick = () => {
    const clickedBanner = list[bannerState - 1];
    const index = list.findIndex((x) => x.id === clickedBanner.id);
    setIndex(index);
    const newList = list.filter((x) => x.id !== clickedBanner.id);
    setList(newList);
    var DateTime = moment(new Date());
    const laterAnnouncementDetail = ls.get("later_announcements_detail");
    if (laterAnnouncementDetail === null) {
      ls.set("later_announcements_detail", [{ id: list[bannerState - 1].id, dateTime: DateTime }]);
    } else {
      const getCurrentAnnouncementsDetail = ls.get("later_announcements_detail");
      for (let i = 0; i < getCurrentAnnouncementsDetail.length; i++) {
        if (getCurrentAnnouncementsDetail[i].id === list[bannerState - 1].id) {
          ls.set("later_announcements_detail", [
            { id: list[bannerState - 1].id, dateTime: DateTime }
          ]);
        }
      }
      getCurrentAnnouncementsDetail.push({ id: list[bannerState - 1].id, dateTime: DateTime });
      ls.set("later_announcements_detail", getCurrentAnnouncementsDetail);
    }
  };

  return (
    <>
      {show && superList.length > 0 ? (
        list.length > 0 &&
        currentAnnouncement.map((x, i) => {
          return (
            <div
              className={
                mounted ? "announcement-container feedbackmounted" : "announcement-container"
              }
              key={i}
            >
              <div className="feedback-announcement">
                <div className="row">
                  {/* First Column */}
                  <div className="column left">
                    <div className="up-carousel-svg" onClick={upClick}>
                      {list.length > 1 ? upCarouselSvg : <></>}
                    </div>
                  </div>
                  {/* Second Column */}
                  <div className="column center">
                    <div className="main">
                      <div className="announcement-title">
                        <p>{x?.title}</p>
                      </div>
                    </div>
                    <div className="announcement-message">
                      <p>{x?.description}</p>
                    </div>
                    <div className="buttons">
                      <div className="learn-btn action-btn">
                        <a href={x?.button_link}>
                          <button>{x?.button_text}</button>
                        </a>
                      </div>
                      <div className="dismiss-btn">
                        <button onClick={dismissClick}>{"Dismiss"}</button>
                      </div>
                      <div className="action-btn">
                        <button onClick={laterClick}>{"Later"}</button>
                      </div>
                    </div>
                  </div>
                  {/* Third Column */}
                  <div className="column right">
                    {/* Close Button */}
                    <button onClick={closeClick} className="close-button">
                      <span aria-hidden="true">&times;</span>
                    </button>
                    <div className="down-carousel-svg" onClick={downClick}>
                      {list.length > 1 ? downCarouselSvg : <></>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <></>
      )}
    </>
  );
};

export default Announcement;
