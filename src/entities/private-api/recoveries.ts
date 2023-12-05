export interface Recoveries {
  username: string;
  email: string;
  publicKeys: Record<string, number>;
}

export interface GetRecoveriesEmailResponse extends Recoveries {
  _id: string;
}
