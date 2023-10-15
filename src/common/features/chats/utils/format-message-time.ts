import moment from "moment";

export const formatMessageTime = (unixTs: number) => moment.unix(unixTs).format("h:mm a");

export const formatMessageDate = (unixTs: number) => moment.unix(unixTs).format("dddd, MMMM Do");
