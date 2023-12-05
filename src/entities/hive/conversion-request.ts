export interface ConversionRequest {
  amount: string;
  conversion_date: string;
  id: number;
  owner: string;
  requestid: number;
}

export interface CollateralizedConversionRequest {
  collateral_amount: string;
  conversion_date: string;
  converted_amount: string;
  id: number;
  owner: string;
  requestid: number;
}
