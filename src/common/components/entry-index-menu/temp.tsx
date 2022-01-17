import React from 'react'
import DropDown, { MenuItem } from "../dropdown";
import { Global } from "../../store/global/types";
import {History} from "history";
import { _t } from "../../i18n";
import {
    menuDownSvg,
} from "../../img/svg";

interface Props {
    global: Global;
    history: History;
}

export const Temp = (props: Props) => {
    const { global: { filter, tag }, history } = props;

    let dropDownItems: MenuItem[] = [
        {
            label: <span>{_t('entry-filter.filter-global')}</span>,
            active: tag === "",
            onClick: () => onTagValueClick('')
        },
        {
            label: <span>My Community</span>,
            active: tag === "my",
            onClick: () => onTagValueClick('/my')

        }
    ]

    if(filter === 'created') {
        dropDownItems = [
            ...dropDownItems,
            {
                label: <span>Now</span>,
                active: tag === "right_now",
                onClick: () => console.log('right_now clicked'), 
            },
            {
                label: <span>Today</span>,
                active: tag === "to_day",
                onClick: () => console.log('to_day clicked'), 
            },
            {
                label: <span>This Week</span>,
                active: tag === "this_week",
                onClick: () => console.log('this_week clicked'), 
            },
            {
                label: <span>This Month</span>,
                active: tag === "this_month",
                onClick: () => console.log('this_month clicked'), 
            }
        ]
    }

    const dropDownConfig = {
        history: null,
        label: (

            
            <div className='tagDropDown'>
                {tag === "" ? 'Global' : tag === 'my' ? 'My Community' : tag}
                {""}
                {menuDownSvg}
            </div>
        ),
        items: dropDownItems,
    };

    const onTagValueClick = (key: string) => {
        filter !== 'feed' && history.push('/' + filter  + key)
    }

return (
        <DropDown {...dropDownConfig} float="left" header="" />
);
}



