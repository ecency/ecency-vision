import React from 'react'
import DropDown, { MenuItem } from "../dropdown";
import { Global } from "../../store/global/types";
import { History } from "history";
import { _t } from "../../i18n";
import {
  menuDownSvg,
} from "../../img/svg";

interface Props {
  global: Global;
  history: History;
  onChangeGlobal: () => void;
  isGlobal: boolean;
}

export const EntryIndexMenuDropdown = (props: Props) => {
  // const { global: { filter, tag }, history } = props;
  const { global: { filter, tag }, history, onChangeGlobal, isGlobal } = props;

  let dropDownItems: MenuItem[] = [
    {
      label: <span>{_t('entry-filter.filter-global')}</span>,
      active: tag === "" || ((tag.length > 0) && (tag !== 'my')),
      onClick: () => onTagValueClick('')
    },
    {
      label: <span>{_t('entry-filter.filter-community')}</span>,
      active: tag === "my",
      onClick: () => onTagValueClick('/my')

    }
  ]

  if (filter === 'created') {
    dropDownItems = [
      ...dropDownItems,
      // {
      //   label: <span>Now</span>,
      //   active: tag === "right_now",
      //   onClick: () => console.log('right_now clicked'),
      // },
      // {
      //   label: <span>Today</span>,
      //   active: tag === "to_day",
      //   onClick: () => console.log('to_day clicked'),
      // },
      // {
      //   label: <span>This Week</span>,
      //   active: tag === "this_week",
      //   onClick: () => console.log('this_week clicked'),
      // },
      // {
      //   label: <span>This Month</span>,
      //   active: tag === "this_month",
      //   onClick: () => console.log('this_month clicked'),
      // }
    ]
  }

  const dropDownConfig = {
    history: null,
    label: (
      <div className='tagDropDown'>
        {tag === "" ? _t('entry-filter.filter-global') : tag === 'my' ? _t('entry-filter.filter-community') : tag}
        {""}
        {menuDownSvg}
      </div>
    ),
    items: dropDownItems,
  };

  const onTagValueClick = (key: string) => {
    // filter !== 'feed' && history.push('/' + filter + key)
    if ((isGlobal && (key.length < 1)) || (!isGlobal && (key.length > 0))) {
      return
    } else {
      onChangeGlobal()
    }
  }

  return (
    <DropDown {...dropDownConfig} float="left" header="" />
  );
}



