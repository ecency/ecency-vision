export interface HiveSignerMessage {
  signed_message: {
    type: string;
    app: string;
  };
  authors: string[];
  timestamp: number;
  signatures?: string[];
}
