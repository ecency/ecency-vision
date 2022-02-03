import { communities, hot, magnifySvg } from "../../img/svg";
import { HotListItem, SearchListItem } from "../deck/deck-items";
import { hotListItems, searchListItems, tagsListItems } from "../deck/mockData";

export const decks = [
    {data: hotListItems, listItemComponent: HotListItem, header: {title: "Title", icon: hot}},
    {data: searchListItems, listItemComponent: SearchListItem, header: {title: "Games", icon: magnifySvg}},
    {data: tagsListItems, listItemComponent: SearchListItem, header: {title: "Title", icon: communities}},
]