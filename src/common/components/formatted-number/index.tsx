import React, { Component } from "react";

import numeral from "numeral";

interface Props {
  value: number | string;
  fractionDigits: number;
  prefix: string;
  suffix: string;
}

export default class FormattedNumber extends Component<Props> {
  public static defaultProps: Partial<Props> = {
    fractionDigits: 3,
    prefix: "",
    suffix: "",
  };

  render() {
    const { value, fractionDigits, prefix, suffix } = this.props;

    const format = "0,0." + "0".repeat(fractionDigits);

    let out = "";

    if (prefix) out += prefix + " ";
    out += numeral(value).format(format);
    if (suffix) out += " " + suffix;

    return <>{out}</>;
  }
}
