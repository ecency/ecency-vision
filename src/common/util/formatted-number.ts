import numeral from "numeral";

interface Options {
  fractionDigits?: number;
  prefix?: string;
  suffix?: string;
}

export default (value: number | string, options: Options | undefined = undefined) => {
  let opts: Options = {
    fractionDigits: 3,
    prefix: "",
    suffix: "",
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
  out += numeral(value).format(format);
  if (suffix) out += " " + suffix;

  return out;
};
