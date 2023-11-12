import React, { Component } from "react";
import { History } from "history";
import { Link } from "react-router-dom";
import { EntryFilter, Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";
import DropDown, { MenuItem } from "../dropdown";
import ListStyleToggle from "../list-style-toggle";
import { _t } from "../../i18n";
import * as ls from "../../util/local-storage";
import _c from "../../util/fix-class-names";
import { informationVariantSvg, kebabMenuHorizontalSvg } from "../../img/svg";
import { apiBase } from "../../api/helper";
import { Introduction } from "../introduction";
import { EntryIndexMenuDropdown } from "../entry-index-menu-dropdown";
import { ToggleType } from "../../store/ui/types";
import "./_index.scss";

interface Props {
  history: History;
  global: Global;
  activeUser: ActiveUser | any;
  noReblog: boolean;
  toggleListStyle: (view: string | null) => void;
  toggleUIProp: (what: ToggleType) => void;
  handleFilterReblog: () => void;
}

export enum IntroductionType {
  FRIENDS = "FRIENDS",
  TRENDING = "TRENDING",
  HOT = "HOT",
  NEW = "NEW",
  NONE = "NONE"
}

interface States {
  isGlobal: boolean;
  isMounted: boolean;
  introduction: IntroductionType;
  prevFilter: string;
}

export const isMyPage = (global: Global, activeUser: ActiveUser | null) => {
  const { filter, tag } = global;
  return (
    activeUser &&
    activeUser !== null &&
    ((activeUser.username === tag.replace("@", "") && filter === "feed") || tag === "my")
  );
};

export const isActiveUser = (activeUser: ActiveUser | null) => {
  return activeUser !== null;
};

export class EntryIndexMenu extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    const {
      activeUser,
      history: {
        location: { pathname }
      },
      global: { filter }
    } = props;
    let isGlobal = !pathname.includes("/my");
    if (activeUser && isActiveUser(activeUser) && pathname.includes(activeUser.username)) {
      isGlobal = false;
    }
    let showInitialIntroductionJourney =
      activeUser && isActiveUser(activeUser) && ls.get(`${activeUser.username}HadTutorial`);
    if (
      activeUser &&
      isActiveUser(activeUser) &&
      (showInitialIntroductionJourney === "false" || showInitialIntroductionJourney === null)
    ) {
      showInitialIntroductionJourney = true;
      ls.set(`${activeUser.username}HadTutorial`, "true");
    }
    if (showInitialIntroductionJourney === true) {
      showInitialIntroductionJourney = IntroductionType.FRIENDS;
    } else {
      showInitialIntroductionJourney = IntroductionType.NONE;
    }
    this.state = {
      isGlobal,
      introduction: showInitialIntroductionJourney,
      isMounted: false,
      prevFilter: ""
    };
    this.onChangeGlobal = this.onChangeGlobal.bind(this);
  }

  componentDidMount() {
    const {
      global: { filter }
    } = this.props;
    const { introduction } = this.state;
    if (introduction === IntroductionType.NONE) {
      if (typeof window !== "undefined") {
        document.getElementById("overlay") &&
          document.getElementById("overlay")!.classList.remove("overlay-for-introduction");
        document.getElementById("feed") &&
          document.getElementById("feed")!.classList.remove("active");
        document.getElementById(filter) && document.getElementById(filter)!.classList.add("active");
        document.getElementsByTagName("ul") &&
          document.getElementsByTagName("ul")[0] &&
          document.getElementsByTagName("ul")[0]!.classList.remove("flash");
        let entryIndexMenuElements = document.getElementsByClassName("entry-index-menu");
        entryIndexMenuElements &&
          entryIndexMenuElements.length > 1 &&
          entryIndexMenuElements[0] &&
          entryIndexMenuElements[0].classList.remove("entry-index-menu");
      }
    }
    this.setState({ isMounted: true });
  }

  onChangeGlobal(value: string) {
    const {
      history,
      global: { tag, filter }
    } = this.props;
    this.setState({ isGlobal: value ? false : true });
    // if (value) {
    //     history.push(`/${filter}`)
    // } else {
    //     history.push(`/${filter}/my`)
    // }
    const temp = value ? "/" + value : "";
    if (value === "my") {
      history.push(`/${filter}/my`);
    } else {
      history.push(`/${filter}${temp}`);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      history,
      activeUser,
      global: { tag, filter }
    } = this.props;

    if (
      !history.location.pathname.includes(prevProps.global.filter) &&
      ["rising", "controversial"].includes(prevProps.global.filter)
    )
      this.setState({ prevFilter: prevProps.global.filter });

    if (history.location.pathname.includes("/my") && !isActiveUser(activeUser)) {
      history.push(history.location.pathname.replace("/my", ""));
    }
    // else if (!isActiveUser(activeUser) && (filter === 'feed')) {
    //     history.push('/trending')
    // }
    // else if (!isActiveUser(activeUser) && (prevProps.global.filter === 'feed') && (filter === 'trending' || filter === 'hot' || filter === 'created') && (tag.includes('@'))) {
    //     history.push(`/${filter}`)
    // }
    else if (
      !isActiveUser(prevProps.activeUser) !== !isActiveUser(activeUser) &&
      filter !== "feed"
    ) {
      let isGlobalValue = tag.length > 0 && tag === "my" ? false : true;
      this.setState({ isGlobal: isGlobalValue });
    } else if (
      prevProps.activeUser &&
      activeUser &&
      prevProps.activeUser?.username !== activeUser?.username &&
      filter === "feed"
    ) {
      history.push(`/@${activeUser?.username}/${filter}`);
    } else if (
      ["controversial", "rising"].includes(prevProps.global.filter) &&
      !["controversial", "rising"].includes(filter)
    ) {
      if (tag && tag.includes("@")) {
        history.push(`/${tag}/${filter}`);
      } else {
        history.push(`/${filter}`);
      }
    } else if (["controversial", "rising"].includes(filter)) {
      const tagValue =
        tag && tag !== "my" && ["today", "week", "month", "year", "all"].includes(tag)
          ? "/" + tag
          : "/today";
      history.push(`/${filter}${tagValue}`);
    }
    /*else if(!['controversial', 'rising'].includes(filter)) {
            const tagValue = ['today', 'week', 'month', 'year', 'all'].includes(tag) ? '' : '/' + tag
            history.push(`/${filter}${tagValue}`)
        }*/

    let showInitialIntroductionJourney =
      activeUser && isActiveUser(activeUser) && ls.get(`${activeUser.username}HadTutorial`);
    if (
      prevProps.activeUser !== activeUser &&
      activeUser &&
      isActiveUser(activeUser) &&
      (showInitialIntroductionJourney === "false" || showInitialIntroductionJourney === null)
    ) {
      showInitialIntroductionJourney = true;
      ls.set(`${activeUser.username}HadTutorial`, "true");
      this.setState({
        introduction: showInitialIntroductionJourney
          ? IntroductionType.FRIENDS
          : IntroductionType.NONE
      });
    }
    if (
      prevProps.activeUser !== activeUser &&
      !activeUser &&
      !isActiveUser(activeUser) &&
      ls.get(`${prevProps.activeUser!.username}HadTutorial`)
    ) {
      this.setState({ introduction: IntroductionType.NONE });
    }
  }

  onClosePopup = () => {
    this.setState({ introduction: IntroductionType.NONE });
  };

  getPopupTitle = () => {
    let value = "";
    switch (this.state.introduction) {
      case IntroductionType.TRENDING:
        value = "filter-trending";
        break;
      case IntroductionType.HOT:
        value = "filter-hot";
        break;
      case IntroductionType.NEW:
        value = "filter-created";
        break;
      case IntroductionType.FRIENDS:
        value = "filter-feed-friends";
        break;
      default:
        value = value;
    }
    return _t(`entry-filter.${value}`);
  };

  onNextWeb = () => {
    let value: IntroductionType = this.state.introduction;
    switch (value) {
      case IntroductionType.TRENDING:
        value = IntroductionType.HOT;
        break;
      case IntroductionType.HOT:
        value = IntroductionType.NEW;
        break;
      case IntroductionType.NEW:
        value = IntroductionType.NONE;
        break;
      default:
        value = value;
    }
    this.setState({ introduction: value });
  };

  onNextMobile = () => {
    let value: IntroductionType = this.state.introduction;
    switch (value) {
      case IntroductionType.TRENDING:
        value = IntroductionType.HOT;
        break;
      case IntroductionType.HOT:
        value = IntroductionType.NEW;
        break;
      case IntroductionType.FRIENDS:
        value = IntroductionType.TRENDING;
        break;
      case IntroductionType.NEW:
        value = IntroductionType.NONE;
        break;
      default:
        value = value;
    }
    this.setState({ introduction: value });
  };

  onPreviousWeb = () => {
    const { activeUser } = this.props;
    let value: IntroductionType = this.state.introduction;
    switch (value) {
      case IntroductionType.NEW:
        value = IntroductionType.HOT;
        break;
      case IntroductionType.HOT:
        value = IntroductionType.TRENDING;
        break;
      case IntroductionType.TRENDING:
        value =
          activeUser && isActiveUser(activeUser) ? IntroductionType.FRIENDS : IntroductionType.NONE;
        break;
      default:
        value = value;
    }
    this.setState({ introduction: value });
  };

  onPreviousMobile = () => {
    const { activeUser } = this.props;
    let value: IntroductionType = this.state.introduction;
    switch (value) {
      case IntroductionType.NEW:
        value = IntroductionType.HOT;
        break;
      case IntroductionType.HOT:
        value = IntroductionType.TRENDING;
        break;
      case IntroductionType.TRENDING:
        value =
          activeUser && isActiveUser(activeUser) ? IntroductionType.FRIENDS : IntroductionType.NONE;
        break;
      case IntroductionType.FRIENDS:
        value = IntroductionType.NONE;
        break;
      default:
        value = value;
    }
    this.setState({ introduction: value });
  };

  render() {
    const { activeUser, global, history } = this.props;
    const { isGlobal, introduction, isMounted } = this.state;
    const { filter, tag } = global;
    const isMy = isMyPage(global, activeUser);
    const isActive = isActiveUser(activeUser);
    const OurVision = apiBase(`/assets/our-vision.${global.canUseWebp ? "webp" : "png"}`);
    let secondaryMenu = [
      {
        label: _t(`entry-filter.filter-controversial`),
        href: `/controversial/today`,
        selected: filter === "controversial",
        id: "controversial"
      },
      {
        label: _t(`entry-filter.filter-rising`),
        href: `/rising/today`,
        selected: filter === "rising",
        id: "rising"
      }
    ];

    let rising = secondaryMenu.filter((f) => f.id === "rising");
    let controversial = secondaryMenu.filter((f) => f.id === "controversial");

    if (
      location.pathname.includes("rising") ||
      (!location.pathname.includes("controversial") && this.state.prevFilter === "rising")
    )
      secondaryMenu = [...rising, ...controversial];
    else secondaryMenu = [...controversial, ...rising];

    let menuTagValue = tag ? `/${tag}` : "";

    // @ts-ignore
    const menuConfig: {
      history: History;
      label: string;
      items: MenuItem[];
    } = {
      history: this.props.history,
      label:
        isMy && filter === "feed"
          ? _t("entry-filter.filter-feed-friends")
          : _t(`entry-filter.filter-${filter}`),
      items: [
        ...[EntryFilter.trending, EntryFilter.hot, EntryFilter.created].map((x) => {
          return {
            label: _t(`entry-filter.filter-${x}`),
            href: isActive
              ? filter === "feed" && !isGlobal
                ? `/${x}/my`
                : filter === "feed" && isGlobal
                ? `/${x}`
                : `/${x}${menuTagValue}`
              : tag[0] === "@"
              ? `/${x}`
              : `/${x}${menuTagValue}`,
            selected: filter === x || filter === x + "/my",
            id: x,
            flash:
              (x === "trending" && introduction === IntroductionType.TRENDING) ||
              (x === "hot" && introduction === IntroductionType.HOT) ||
              (x === "created" && introduction === IntroductionType.NEW)
          };
        }),
        { ...secondaryMenu[0] }
      ]
    };

    const kebabMenuConfig = {
      history: this.props.history,
      label: "",
      icon: kebabMenuHorizontalSvg,
      items: [{ ...secondaryMenu[1] }]
    };

    const mobileMenuConfig = !isActive
      ? menuConfig
      : {
          ...menuConfig,
          items: [
            {
              label: _t(`entry-filter.filter-feed-friends`),
              href: `/@${activeUser?.username}/feed`,
              selected: filter === "feed",
              id: "feed"
            },
            ...menuConfig.items,
            ...kebabMenuConfig.items
          ]
        };

    const introductionDescription = (
      <>
        {_t("entry-filter.filter-global-part1")}
        <span className="text-capitalize">{_t(`${this.getPopupTitle()}`)}</span>
        {introduction === IntroductionType.FRIENDS && _t("entry-filter.filter-global-part4")}
        {introduction === IntroductionType.FRIENDS && (
          <Link className="text-blue-dark-sky" to="/discover">
            {" "}
            {_t("entry-filter.filter-global-discover")}
          </Link>
        )}
        {isGlobal &&
          introduction !== IntroductionType.FRIENDS &&
          _t("entry-filter.filter-global-part2")}
        {!isGlobal &&
          introduction !== IntroductionType.FRIENDS &&
          _t("entry-filter.filter-global-part3")}
        {!isGlobal && introduction !== IntroductionType.FRIENDS && (
          <Link className="text-blue-dark-sky" to="/communities">
            {" "}
            {_t("entry-filter.filter-global-join-communities")}
          </Link>
        )}
      </>
    );
    const introductionOverlayClass =
      (isMounted &&
        (introduction === IntroductionType.NONE ? "hidden" : "overlay-for-introduction")) ||
      "hidden";
    return isMounted ? (
      <div>
        <div className={introductionOverlayClass} id="overlay" onClick={this.onClosePopup} />
        <div className="entry-index-menu flex items-center justify-center md:justify-between p-[10px] border-b dark:border-dark-200">
          <div className="the-menu flex flex-col-reverse items-center md:flex-row">
            {isActive && (
              <div className="hidden lg:flex items-center mt-3 md:mt-0 md:mr-4 lg:mr-0">
                <ul
                  className={`flex flex-wrap relative mb-0 ${
                    introduction === IntroductionType.NONE
                      ? ""
                      : introduction === IntroductionType.FRIENDS
                      ? "flash"
                      : ""
                  }`}
                >
                  <li>
                    <Link
                      to={`/@${activeUser?.username}/feed`}
                      className={_c(
                        `rounded-2xl flex items-center text-blue-dark-sky hover:text-blue-dark-sky-hover font-[500] px-2.5 ${
                          filter === "feed" &&
                          (introduction === IntroductionType.NONE ||
                            introduction === IntroductionType.FRIENDS)
                            ? "bg-blue-dark-sky text-white hover:text-white"
                            : ""
                        }   ${
                          introduction !== IntroductionType.NONE &&
                          introduction === IntroductionType.FRIENDS
                            ? "bg-blue-dark-sky text-white hover:text-white"
                            : ""
                        }`
                      )}
                      id="feed"
                    >
                      {_t("entry-filter.filter-feed-friends")}
                    </Link>
                  </li>
                  {isMounted &&
                  introduction !== IntroductionType.NONE &&
                  introduction === IntroductionType.FRIENDS ? (
                    <Introduction
                      title={_t("entry-filter.filter-feed-friends")}
                      media={OurVision}
                      onNext={() => {
                        let value = IntroductionType.TRENDING;
                        this.setState({ introduction: value });
                      }}
                      onPrevious={() => {
                        let value = IntroductionType.NONE;
                        this.setState({ introduction: value });
                      }}
                      onClose={this.onClosePopup}
                      description={introductionDescription}
                    />
                  ) : null}
                </ul>
              </div>
            )}
            <div className="flex items-center">
              <div className="main-menu justify-center hidden lg:flex md:mb-0 md:items-center">
                <div className="block md:hidden relative">
                  <DropDown {...menuConfig} float="left" />
                </div>
                <div className="hidden lg:block">
                  <ul className="flex flex-wrap mb-0">
                    {menuConfig.items.map((i, k) => (
                      <li key={k} className={`${i.flash ? "flash" : ""}`}>
                        <Link
                          to={i.href!}
                          className={_c(
                            `text-blue-dark-sky hover:text-blue-dark-sky-hover rounded-2xl flex items-center font-[500] px-2.5 link-${
                              i.id
                            } ${
                              introduction !== IntroductionType.NONE && !i.flash && i.selected
                                ? ""
                                : i.selected || i.flash
                                ? "bg-blue-dark-sky text-white hover:text-white"
                                : ""
                            }`
                          )}
                          id={i.id}
                        >
                          {i.label}
                        </Link>
                      </li>
                    ))}
                    {isMounted &&
                    introduction !== IntroductionType.NONE &&
                    introduction !== IntroductionType.FRIENDS &&
                    (introduction === IntroductionType.HOT ||
                      introduction === IntroductionType.TRENDING ||
                      introduction === IntroductionType.NEW) ? (
                      <Introduction
                        title={this.getPopupTitle()}
                        media={OurVision}
                        placement={
                          introduction === IntroductionType.TRENDING
                            ? "20%"
                            : introduction === IntroductionType.HOT
                            ? "25%"
                            : "30%"
                        }
                        onNext={this.onNextWeb}
                        onPrevious={this.onPreviousWeb}
                        onClose={this.onClosePopup}
                        description={introductionDescription}
                        showFinish={introduction === IntroductionType.NEW}
                      />
                    ) : null}
                  </ul>
                </div>
                <div className="kebab-icon">
                  <DropDown {...kebabMenuConfig} float="left" />
                </div>
              </div>

              <div className="main-menu justify-center flex lg:hidden md:mb-0 md:items-center">
                <div className="lg:hidden relative">
                  <DropDown {...mobileMenuConfig} float="left" />
                  {isMounted && introduction !== IntroductionType.NONE ? (
                    <Introduction
                      title={this.getPopupTitle()}
                      media={OurVision}
                      onNext={this.onNextMobile}
                      onPrevious={this.onPreviousMobile}
                      onClose={this.onClosePopup}
                      description={introductionDescription}
                      showFinish={introduction === IntroductionType.NEW}
                    />
                  ) : null}
                </div>
                <div className="hidden lg:block">
                  <ul className="flex flex-wrap">
                    {mobileMenuConfig.items.map((i, k) => (
                      <li key={k}>
                        <Link
                          to={i.href!}
                          className={_c(
                            `text-blue-dark-sky hover:text-blue-dark-sky-hover rounded-xl flex items-center font-[500] px-2 link-${
                              i.id
                            } ${i.selected ? "active" : ""}`
                          )}
                        >
                          {i.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {filter !== "feed" ? (
                <>
                  <div className="border-l border-[--border-color] ml-3 dropDown-left-border-height" />
                  <span id="check-isGlobal" className="flex items-center pl-3">
                    <EntryIndexMenuDropdown
                      {...this.props}
                      isGlobal={isGlobal}
                      isActive={isActive}
                      onChangeGlobal={this.onChangeGlobal}
                    />
                  </span>
                </>
              ) : (
                <>
                  <div className="border-l border-[--border-color] ml-3 dropDown-left-border-height" />
                  <span id="check-isGlobal" className="flex items-center pl-3">
                    <EntryIndexMenuDropdown
                      {...this.props}
                      isGlobal={isGlobal}
                      isActive={isActive}
                      onChangeGlobal={this.onChangeGlobal}
                    />
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center ml-auto md:ml-0 pl-3">
            <span
              className="info-icon mr-0 md:mr-2"
              onClick={() =>
                this.setState({
                  introduction:
                    filter === "feed"
                      ? IntroductionType.FRIENDS
                      : filter === "trending"
                      ? IntroductionType.TRENDING
                      : filter === "hot"
                      ? IntroductionType.HOT
                      : filter === "created"
                      ? IntroductionType.NEW
                      : IntroductionType.NONE
                })
              }
            >
              {informationVariantSvg}
            </span>
            <ListStyleToggle
              global={this.props.global}
              toggleListStyle={this.props.toggleListStyle}
            />
          </div>
        </div>
      </div>
    ) : null;
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    global: p.global,
    activeUser: p.activeUser,
    noReblog: p.noReblog,
    toggleListStyle: p.toggleListStyle,
    toggleUIProp: p.toggleUIProp,
    handleFilterReblog: p.handleFilterReblog
  };

  return <EntryIndexMenu {...props} />;
};
