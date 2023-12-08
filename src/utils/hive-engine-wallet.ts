import { formattedNumber } from "./formatted-number";

interface Props {
  symbol: string;
  name: string;
  icon: string;
  precision: number;
  stakingEnabled: boolean;
  delegationEnabled: boolean;
  balance: string;
  stake: string;
  delegationsIn: string;
  delegationsOut: string;
}

export class HiveEngineToken {
  symbol: string;
  name?: string;
  icon?: string;

  precision?: number;
  stakingEnabled?: boolean;
  delegationEnabled?: boolean;
  balance: number;
  stake: number;
  stakedBalance: number;
  delegationsIn: number;
  delegationsOut: number;

  constructor(props: Props) {
    this.symbol = props.symbol;
    this.name = props.name || "";
    this.icon = props.icon || "";

    this.precision = props.precision || 0;
    this.stakingEnabled = props.stakingEnabled || false;
    this.delegationEnabled = props.delegationEnabled || false;
    this.balance = parseFloat(props.balance) || 0;
    this.stake = parseFloat(props.stake) || 0;
    this.delegationsIn = parseFloat(props.delegationsIn) || 0;
    this.delegationsOut = parseFloat(props.delegationsOut) || 0;
    this.stakedBalance = this.stake + this.delegationsIn - this.delegationsOut;
  }

  hasDelegations = (): boolean => {
    if (!this.delegationEnabled) {
      return false;
    }

    return this.delegationsIn > 0 && this.delegationsOut > 0;
  };

  delegations = (): string => {
    if (!this.hasDelegations()) {
      return "";
    }

    return `(${formattedNumber(this.stake, {
      fractionDigits: this.precision
    })} + ${formattedNumber(this.delegationsIn, {
      fractionDigits: this.precision
    })} - ${formattedNumber(this.delegationsOut, {
      fractionDigits: this.precision
    })})`;
  };

  staked = (): string => {
    if (!this.stakingEnabled) {
      return "-";
    }

    if (this.stakedBalance < 0.0001) {
      return this.stakedBalance.toString();
    }

    return formattedNumber(this.stakedBalance, { fractionDigits: this.precision });
  };

  balanced = (): string => {
    if (this.balance < 0.0001) {
      return this.balance.toString();
    }

    return formattedNumber(this.balance, { fractionDigits: this.precision });
  };
}
