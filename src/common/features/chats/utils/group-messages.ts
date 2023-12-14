import { Message } from "@ecency/ns-query";

export function groupMessages(messages: Message[]) {
  return messages.reduce<[Date, Message[]][]>((acc, item, currentIndex) => {
    if (currentIndex === 0) {
      return [...acc, [new Date(item.created * 1000), [item]]];
    }

    // If difference less than 5 minutes then we group them together
    const differenceInDates = item.created - messages[currentIndex - 1].created;
    if (differenceInDates * 1000 < 120000) {
      acc[acc.length - 1][1].push(item);
      return acc;
    }

    return [...acc, [new Date(item.created * 1000), [item]]];
  }, []);
}
