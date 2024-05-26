import { bg, enUS, es, fi, hi, id, it, pt, ru, sr, uk, uz, zhCN } from "date-fns/locale";

export function getDateFnsLocale(lang: string) {
  switch (lang) {
    case "es":
      return es;
    case "hi":
      return hi;
    case "it":
      return it;
    case "id":
      return id;
    case "pt":
      return pt;
    case "sr":
      return sr;
    case "fi":
      return fi;
    case "uk":
      return uk;
    case "bg":
      return bg;
    case "ru":
      return ru;
    case "uz":
      return uz;
    case "zh":
      return zhCN;
    default:
      return enUS;
  }
}
