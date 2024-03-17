import React, { Component } from "react";

import { Global } from "../../store/global/types";

import formattedNumber from "../../util/formatted-number";

interface Props {
  global: Global;
  value: number;
  fixAt: number;
}

const prefixes = ["", "m", "µ", "n"];

export default class FormattedCurrency extends Component<Props> {
  public static defaultProps: Partial<Props> = {
    fixAt: 2
  };

  render() {
    const { global, value, fixAt } = this.props;
    const { currencyRate, currencySymbol } = global;

    const valInCurrency = value * currencyRate;

    let multiplier = 1.0;
    let prefix = "";
    if (currencySymbol === "฿" && valInCurrency > 0) {
      let decimal_places = 0;
      let currency_string: string;
      for (; decimal_places < 9; decimal_places += 3, multiplier *= 1000) {
        const truncated_amount = Math.trunc(valInCurrency * Math.pow(10, decimal_places + fixAt));
        if (isNaN(truncated_amount) || truncated_amount > 100) break;
      }
      if (decimal_places === 9) {
        if (isNaN(multiplier * valInCurrency) || multiplier * valInCurrency === 0) {
          decimal_places = 0;
          multiplier = 1.0;
        } else {
          return formattedNumber(valInCurrency * Math.pow(10, 8), {
            fractionDigits: 0,
            suffix: "sats"
          });
        }
      }
      prefix = prefixes[decimal_places / 3];
    }

    return (
      <>
        {formattedNumber(valInCurrency * multiplier, {
          fractionDigits: fixAt,
          prefix: prefix + currencySymbol
        })}
      </>
    );
  }
}
