import numeral from "numeral";
import { isntString, isntNumber, typeCheck } from "../euphoria";

interface Options {
  fractionDigits?: number;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  separators?: boolean;
  prefix?: string;
  suffix?: string;
  debug?: boolean;
  truncate?: boolean;
}
function count0s(s: string) {
  let counter = 0;
  for (const c of s) {
    if (c == "0") ++counter;
  }
  return counter;
}

function max(a: number, b: number) {
  if (a > b) return a;
  return b;
}

export default (value: number | string, options: Options | undefined = undefined) => {
  typeCheck(isntNumber(value) && isntString(value), "number|string", "value", value);

  let addNegativeSignFlag: boolean = false;
  let opts: Options = {
    prefix: "",
    suffix: "",
    debug: false,
    separators: true,
    truncate: false
  };
  if (options) {
    opts = { ...opts, ...options };
  }
  const debugLog = opts.debug;

  if (debugLog)
    console.log({
      value,
      fractionDigits: options?.fractionDigits,
      prefix: options?.prefix,
      suffix: options?.suffix
    });
  const { prefix, suffix, debug, separators, truncate } = opts;
  const minFD: number = options?.minimumFractionDigits ?? options?.fractionDigits ?? 3;
  const maxFD: number = options?.maximumFractionDigits ?? options?.fractionDigits ?? 3;
  if (debugLog) {
    console.log({ maxFD, minFD, value });
  }
  if (minFD > maxFD) {
    return "NaN";
  }
  let out: string = "";
  if (typeof value == "number") {
    // builtin format is buggy when using numbers smaller than 1e-6.
    if (isNaN(value)) {
      return "NaN";
    }
    const unity = Math.pow(10, maxFD);
    if (value < 0) {
      addNegativeSignFlag = true;
    }
    let satoshis: number =
      Math.floor(unity * value + (truncate ? 0 : 0.5)) * (addNegativeSignFlag ? -1 : 1);
    if (satoshis == 0) {
      addNegativeSignFlag = false;
    }
    if (debugLog) console.log({ satoshis, out });
    // virtual decimal digits
    let vdecimalDigits = 0;
    for (; satoshis % 10 == 0 && vdecimalDigits < maxFD - minFD; ++vdecimalDigits) {
      satoshis /= 10;
    }
    while (vdecimalDigits + out.length < maxFD) {
      out = (satoshis % 10) + out;
      satoshis /= 10;
      satoshis = Math.floor(satoshis);
      if (debugLog) console.log({ satoshis, out });
    }
    if (satoshis == 0) {
      while (out.length < minFD) out = "0" + out;
      if (debugLog) console.log({ satoshis, out });
    }
    // out.length==opts.fracitionDigits
    if (out !== "") {
      out = "." + out;
      if (debugLog) console.log({ satoshis, out });
    }
    if (satoshis == 0) {
      out = "0" + out;
      if (debugLog) console.log({ satoshis, out });
    }

    while (satoshis) {
      out = (satoshis % 10) + out;
      satoshis /= 10;
      satoshis = Math.floor(satoshis);
      if (debugLog) console.log({ satoshis, out });
    }
  } else {
    if (value === "NaN") {
      return value;
    }
    value = value.replace(/,/g, "");
    if (debugLog) console.log(value);
    const m = value.match(RegExp(/-?\d+(\.\d+)?/));
    out = m ? m[0] : "NaN";
    if (out === "NaN") {
      if (debugLog) console.log("Value passed in was:", { value });
    }
    if (out.charAt(0) == "-") {
      addNegativeSignFlag = true;
      out = out.slice(1);
    }
  }
  let decimal_location: number = (out.indexOf(".") + out.length + 1) % (out.length + 1);
  while (out.length - decimal_location - 1 > minFD && out.charAt(out.length - 1) === "0") {
    out = out.slice(0, out.length - 1);
  }

  if (debugLog) {
    console.log(out);
  }
  if (separators) {
    // add commas before and after the decimal point for readability
    if (decimal_location + 3 <= out.length) {
      for (let j = decimal_location + 4; j < out.length; j += 4) {
        out = out.slice(0, j) + "," + out.slice(j);
      }
    }
    for (let j = decimal_location - 3; j >= 0; j -= 3) {
      if (j && out[j - 1] != ",") {
        out = out.slice(0, j) + "," + out.slice(j);
        ++decimal_location;
      }
    }
    if (out.charAt(out.length - 1) === ",") {
      out = out.slice(0, out.length - 1);
    }
  }

  if (debugLog) {
    console.log(out);
  }

  if (addNegativeSignFlag) {
    out = "-" + out;
  }
  if (prefix) out = prefix + " " + out;
  if (suffix) out += " " + suffix;
  if (debugLog) console.log({ out });
  return out;
};
