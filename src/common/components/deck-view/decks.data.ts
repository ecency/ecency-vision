import { hot } from "../../img/svg";
import { HotListItem } from "../deck/deck-items";
import { hotListItems } from "../deck/mockData";

export const decks = [
    {data: hotListItems, listItemComponent: HotListItem, header: {title: "Title", icon: hot}},
    {data: hotListItems, listItemComponent: HotListItem, header: {title: "Title", icon: hot}},
    {data: hotListItems, listItemComponent: HotListItem, header: {title: "Title", icon: hot}},
    {data: hotListItems, listItemComponent: HotListItem, header: {title: "Title", icon: hot}},
]