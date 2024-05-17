import { faqKeysGeneral } from "@/consts";
import i18next from "i18next";

export function searchWithinFaq(query: string) {
  return query.length > 0
    ? [...faqKeysGeneral].filter((x) =>
        i18next.t(`static.faq.${x}-body`).toLocaleLowerCase().includes(query.toLocaleLowerCase())
      )
    : [...faqKeysGeneral];
}

export function searchWithinFaqStrict(query: string) {
  return query.length > 0
    ? [...faqKeysGeneral].filter((x) =>
        i18next.t(`static.faq.${x}-body`).toLocaleLowerCase().includes(query.toLocaleLowerCase())
      )
    : [];
}
