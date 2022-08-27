import React from 'react'
import DropDown, { MenuItem } from "../dropdown";
import { Global } from "../../store/global/types";
import { History } from "history";
import { _t } from "../../i18n";
import { ToggleType } from "../../store/ui/types";
import {
  menuDownSvg,
} from "../../img/svg";
import { ActiveUser } from '../../store/active-user/types';


interface Props {
  global: Global;
  history: History;
  onChangeGlobal: (value: string) => void;
  isGlobal: boolean;
  toggleUIProp: (what: ToggleType) => void;
  isActive: boolean;
  activeUser: ActiveUser | any;
  noReblog: boolean;
  handleFilterReblog: () => void;
}

const feedUrlParams : string = window.location.pathname;
const feedByUsername : string = feedUrlParams.substring(1, (feedUrlParams.length - 5));

export const EntryIndexMenuDropdown = (props: Props) => {
  const { global: { filter, tag }, history, onChangeGlobal, isGlobal, activeUser } = props;

  let dropDownItems: MenuItem[] = [
    {
      label: <span>{_t('entry-filter.filter-global')}</span>,
      selected: tag === "",
      onClick: () => onTagValueClick('')
    },
    {
      label: <span>{_t('entry-filter.filter-community')}</span>,
      selected: tag === "my",
      onClick: () => onTagValueClick('my')

    }
  ]

  // if (filter === 'created') {
  //   dropDownItems = [
  //     ...dropDownItems,
  //     for adding new menu items - example shown below
  //     {
  //       label: <span>Now</span>,
  //       active: tag === "right_now",
  //       onClick: () => console.log('right_now clicked'),
  //     },
  //   ]
  // }

  if (filter === 'rising') {
    dropDownItems = [
          {
            label: <span>{_t('entry-filter.filter-today')}</span>,
            selected: tag === "today",
            onClick: () => onTagValueClick('today'),
          },
          {
            label: <span>{_t('entry-filter.filter-week')}</span>,
            selected: tag === "week",
            onClick: () => onTagValueClick('week'),
          },
          {
            label: <span>{_t('entry-filter.filter-month')}</span>,
            selected: tag === "month",
            onClick: () => onTagValueClick('month'),
          },
          {
            label: <span>{_t('entry-filter.filter-year')}</span>,
            selected: tag === "year",
            onClick: () => onTagValueClick('year'),
          },
          {
            label: <span>{_t('entry-filter.filter-alltime')}</span>,
            selected: tag === "all",
            onClick: () => onTagValueClick('all'),
          },
        ]
  }
  if (filter === 'controversial') {
    dropDownItems = [
          {
            label: <span>{_t('entry-filter.filter-week')}</span>,
            selected: tag === "week",
            onClick: () => onTagValueClick('week'),
          },
          {
            label: <span>{_t('entry-filter.filter-month')}</span>,
            selected: tag === "month",
            onClick: () => onTagValueClick('month'),
          },
          {
            label: <span>{_t('entry-filter.filter-year')}</span>,
            selected: tag === "year",
            onClick: () => onTagValueClick('year'),
          },
          {
            label: <span>{_t('entry-filter.filter-alltime')}</span>,
            selected: tag === "all",
            onClick: () => onTagValueClick('all'),
          },
        ]
  }

  if (filter === 'feed') {
    dropDownItems = [
          {
            label: <span>{props.noReblog === true ? _t('entry-filter.filter-with-reblog') : _t('entry-filter.filter-no-reblog')}</span>,
            selected: tag === "no_reblog",
            onClick: () => onTagValueClick('no_reblog'),
          },
        ]
  }

  const dropDownConfig = {
    history: null,
    label: (
      <div className='tagDropDown'>
        <span className='pl-2' />
        {tag === "" ? _t('entry-filter.filter-global') : tag === 'my' ? _t('entry-filter.filter-community') : tag === 'today' ? _t('entry-filter.filter-today') : tag === 'week' ? _t('entry-filter.filter-week') : tag === 'month' ? _t('entry-filter.filter-month'): tag === 'year' ? _t('entry-filter.filter-year') : tag === 'all' ? _t('entry-filter.filter-alltime') : tag === `@${activeUser.username}` || feedByUsername ? (props.noReblog === true ? _t('entry-filter.filter-no-reblog') : _t('entry-filter.filter-with-reblog')) : tag}
        {" "}
        {menuDownSvg}
      </div>
    ),
    items: dropDownItems,
  };

  const onTagValueClick = (key: string) => {
    const { toggleUIProp, isActive } = props;
    if (key === 'my' && !isActive) {
      toggleUIProp('login')
    } else if (key === 'no_reblog') {
      props.handleFilterReblog();
    } else {
      // onChangeGlobal(!(key.length > 0))
      onChangeGlobal(key)
    }
  }

  return (
    <DropDown {...dropDownConfig} float="left" header="" />
  );
}



