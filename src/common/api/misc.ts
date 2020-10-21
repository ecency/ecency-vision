import {_u} from "./private";

export const getEmojiData = () => fetch(_u("/emoji.json")).then((response) => response.json());
