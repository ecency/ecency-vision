export const getEmojiData = () => fetch("/emoji.json").then((response) => response.json());
