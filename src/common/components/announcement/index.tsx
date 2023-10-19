import React, { useEffect, useState } from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import * as ls from "../../util/local-storage";
import { closeSvg } from "../../img/svg";
import { Announcement as AnnouncementApiData, getAnnouncementsData } from "../../api/private-api";
import { Announcement, LaterAnnouncement } from "./types";
import { useLocation } from "react-router";
import { _t } from "../../i18n";
import { ActiveUser } from "../../store/active-user/types";
import "./index.scss";
import { Button } from "@ui/button";

interface Props {
  activeUser: ActiveUser | null;
}

const Announcement = ({ activeUser }: Props) => {
  const routerLocation = useLocation();

  const [allAnnouncements, setAllAnnouncements] = useState<AnnouncementApiData[]>([]);
  const [show, setShow] = useState(true);
  const [list, setList] = useState<Announcement[]>([]);
  const [superList, setSuperList] = useState<Announcement[]>([]);
  const [bannerState, setBannerState] = useState(1);
  const [index, setIndex] = useState(0);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement[]>([]);

  useEffect(() => {
    getAnnouncementsData().then((data) => setAllAnnouncements(data));
  }, []);

  useEffect(() => {
    getAnnouncements();
  }, [routerLocation, allAnnouncements, activeUser]);

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

  const getAnnouncements = () => {
    const data = allAnnouncements
      .filter((announcement) => (announcement.auth ? !!activeUser : true))
      .filter((announcement) => {
        if (typeof announcement.path === "object") {
          return announcement.path.some((aPath) => routerLocation.pathname.match(aPath));
        }
        return routerLocation.pathname.match(announcement.path);
      });

    const dismissList: number[] = ls.get("dismiss_announcements");
    const laterList: LaterAnnouncement[] = ls.get("later_announcements_detail");
    const displayList: Announcement[] = [];

    data.forEach((announcement) => {
      if (dismissList !== null && dismissList.includes(announcement.id)) {
        return;
      }
      if (laterList) {
        const filteredAnnouncement: LaterAnnouncement[] = laterList.filter(
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
    });

    setList(displayList);
    setSuperList(displayList);
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
    const DateTime = moment(new Date());
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
      {show && currentAnnouncement.length > 0 ? (
        list.length > 0 &&
        currentAnnouncement.map((x, i) => {
          return (
            <div className="announcement-container" key={i}>
              <div className="feedback-announcement">
                <div className="flex flex-col gap-3 justify-center">
                  <div className="main">
                    <div className="announcement-title">
                      <p>{x?.title}</p>
                    </div>
                  </div>
                  <div className="announcement-message">
                    <p>{x?.description}</p>
                  </div>
                  <div className="flex actions">
                    <Link to={x?.button_link} onClick={dismissClick}>
                      <Button>{x?.button_text}</Button>
                    </Link>
                    <Button onClick={laterClick} appearance="primary" outline={true}>
                      {_t("announcements.later")}
                    </Button>
                    {list.length > 1 ? (
                      <Button onClick={upClick} appearance="link">
                        {_t("announcements.next")}
                      </Button>
                    ) : (
                      <></>
                    )}
                  </div>
                  <Button
                    className="close-btn"
                    appearance="link"
                    onClick={() => {
                      closeClick();
                      dismissClick();
                    }}
                  >
                    {closeSvg}
                  </Button>
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
