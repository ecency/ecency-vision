import React from 'react'
import DropDown, { MenuItem } from "../dropdown";
import { Global } from "../../store/global/types";
import { History } from "history";
import { _t } from "../../i18n";
import { ToggleType } from "../../store/ui/types";
import {
  menuDownSvg,
} from "../../img/svg";

interface Props {
  global: Global;
  history: History;
  onChangeGlobal: (value: boolean) => void;
  isGlobal: boolean;
  toggleUIProp: (what: ToggleType) => void;
  isActive: boolean;
}

export const EntryIndexMenuDropdown = (props: Props) => {
  const { global: { filter, tag }, history, onChangeGlobal, isGlobal } = props;

  let dropDownItems: MenuItem[] = [
    {
      label: <span>{_t('entry-filter.filter-global')}</span>,
      active: tag === "",
      onClick: () => onTagValueClick('')
    },
    {
      label: <span>{_t('entry-filter.filter-community')}</span>,
      active: tag === "my",
      onClick: () => onTagValueClick('my')

    }
  ]

  if (filter === 'created') {
    dropDownItems = [
      ...dropDownItems,
      // for adding new menu items - example shown below
      // {
      //   label: <span>Now</span>,
      //   active: tag === "right_now",
      //   onClick: () => console.log('right_now clicked'),
      // },
    ]
  }

  const dropDownConfig = {
    history: null,
    label: (
      <div className='tagDropDown'>
        <span className='pl-2' />
        {tag === "" ? _t('entry-filter.filter-global') : tag === 'my' ? _t('entry-filter.filter-community') : tag}
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
    } else {
      onChangeGlobal(!(key.length > 0))
    }
  }

  return (
    <DropDown {...dropDownConfig} float="left" header="" />
  );
}



