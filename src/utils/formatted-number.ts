import numeral from "numeral";

interface Options {
  fractionDigits?: number;
  prefix?: string;
  suffix?: string;
}

export function formattedNumber(value: number | string, options: Options | undefined = undefined) {
  let opts: Options = {
    fractionDigits: 3,
    prefix: "",
    suffix: ""
  };

  if (options) {
    opts = { ...opts, ...options };
  }

  const { fractionDigits, prefix, suffix } = opts;

  let format = "0,0";

  if (fractionDigits) {
    format += "." + "0".repeat(fractionDigits);
  }

  let out = "";

  if (prefix) out += prefix + " ";
  // turn too small values to zero. Bug: https://github.com/adamwdraper/Numeral-js/issues/563
  const av = Math.abs(parseFloat(value.toString())) < 0.0001 ? 0 : value;
  out += numeral(av).format(format);
  if (suffix) out += " " + suffix;

  return out;
}

export function rcFormatter(num: number) {
  const result: any =
    Math.abs(num) > 999 && Math.abs(num) < 1000000
      ? `${Math.sign(num) * parseFloat((Math.abs(num) / 1000).toFixed(2))}K`
      : Math.abs(num) > 999999 && Math.abs(num) < 1000000000
        ? `${Math.sign(num) * parseFloat((Math.abs(num) / 1000000).toFixed(2))}M`
        : Math.abs(num) > 999999999 && Math.abs(num) < 1000000000000
          ? `${Math.sign(num) * parseFloat((Math.abs(num) / 1000000000).toFixed(2))}B`
          : Math.abs(num) > 999999999999 && Math.abs(num) < 1000000000000000
            ? `${Math.sign(num) * parseFloat((Math.abs(num) / 1000000000000).toFixed(2))}T`
            : Math.abs(num) > 999999999999999 && Math.abs(num) < 1000000000000000000
              ? `${Math.sign(num) * parseFloat((Math.abs(num) / 1000000000000000).toFixed(2))}Q`
              : Math.sign(num) * Math.abs(num);
  return result;
}
