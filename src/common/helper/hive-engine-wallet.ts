import formattedNumber from "../util/formatted-number";
import { TokenBalance, Token, TokenMetadata } from "../api/hive-engine";

export class HiveEngineTokenBalance {
  symbol: string = "";
  name: string = "";
  desc: string = "";
  issuer: string = "";
  url: string = "";
  icon: string = "";

  precision: number = 0;
  stakingEnabled: boolean = false;
  totalStaked: number = 0;
  unstakingCooldown: number = 0;

  delegationEnabled: boolean = false;
  undelegationCooldown: number = 0;

  supply: number = 0;
  maxSupply: number = 0;
  circulatingSupply: number = 0;
  numberTransactions: number = 0;

  balance: number = 0;
  stake: number = 0;
  stakedBalance = 0;
  delegationsIn: number = 0;
  delegationsOut: number = 0;
  pendingUnstake: number = 0;
  pendingUndelegations: number = 0;

  constructor(
    balance: TokenBalance,
    token: Token,
    tokenMetadata: TokenMetadata
  ) {
    this.symbol = balance.symbol;
    this.name = token.name;
    this.desc = tokenMetadata.desc;
    this.issuer = token.issuer;
    this.url = tokenMetadata.url;
    this.icon = tokenMetadata.icon;

    this.precision = token.precision;
    this.stakingEnabled = token.stakingEnabled;
    this.totalStaked = parseFloat(token.totalStaked);
    this.unstakingCooldown = token.unstakingCooldown;

    this.delegationEnabled = token.delegationEnabled;
    this.undelegationCooldown = token.undelegationCooldown;

    this.supply = parseFloat(token.supply);
    this.maxSupply = parseFloat(token.maxSupply);
    this.circulatingSupply = parseFloat(token.circulatingSupply);
    this.numberTransactions = token.numberTransactions;

    this.balance = parseFloat(balance.balance);
    this.stake = parseFloat(balance.stake);
    this.stakedBalance = this.stake + this.delegationsIn - this.delegationsOut;
    this.pendingUnstake = parseFloat(balance.pendingUnstake);
    this.delegationsIn = parseFloat(balance.delegationsIn);
    this.delegationsOut = parseFloat(balance.delegationsOut);
    this.pendingUndelegations = parseFloat(balance.pendingUndelegations);
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
      fractionDigits: this.precision,
    })} + ${formattedNumber(this.delegationsIn, {
      fractionDigits: this.precision,
    })} - ${formattedNumber(this.delegationsOut, {
      fractionDigits: this.precision,
    })})`;
  };
}
