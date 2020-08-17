export enum TransactionType {
    CHECKIN = 10,
    LOGIN = 20,
    CHECKIN_EXTRA = 30,
    POST = 100,
    COMMENT = 110,
    VOTE = 120,
    REBLOG = 130,
    DELEGATION = 150,
    REFERRAL = 160,
    TRANSFER_SENT = 998,
    TRANSFER_INCOMING = 999,
    OTHER = 991
}

export interface PointTransaction {
    id: number;
    type: TransactionType;
    created: string;
    memo: string | null;
    amount: string;
    sender: string | null;
    receiver: string | null;
}

export interface Points {
    points: string;
    uPoints: string;
    transactions: PointTransaction[];
}

export enum ActionTypes {
    FETCH = "@points/FETCH",
    FETCHED = "@points/FETCHED",
}

export interface FetchAction {
    type: ActionTypes.FETCH;
}

export interface FetchedAction {
    type: ActionTypes.FETCHED;
    points: string;
    uPoints: string;
    transactions: PointTransaction[];
}

export type Actions = FetchAction | FetchedAction ;
