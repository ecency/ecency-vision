// @source https://ecency.com/hive-139531/@andablackwidow/rc-stats-in-1-27
export type RcOperation =
  | "comment_operation"
  | "vote_operation"
  | "transfer_operation"
  | "custom_json_operation";

export interface RcOperationStats {
  count: number; // number of such operations executed during last day
  avg_cost_rc: number; // average RC cost of single operation
  resource_cost: {
    // average RC cost split between various resources
    history_rc: number;
    tokens_rc: number;
    market_rc: number;
    state_rc: number;
    exec_rc: number;
  };
  resource_cost_share: {
    // share of resource cost in average final cost (expressed in basis points)
    history_bp: number;
    tokens_bp: number;
    market_bp: number;
    state_bp: number;
    exec_bp: number;
  };
  resource_usage: {
    // average consumption of resources per operation
    history_bytes: number; // - size of transaction in bytes
    tokens: string; // - number of tokens (always 0 or 1 (with exception of multiop) - tokens are internally expressed with 4 digit precision
    market_bytes: number; // - size of transaction in bytes when it belongs to market category or 0 otherwise
    state_hbytes: number; // - hour-bytes of state
    exec_ns: number; // - nanoseconds of execution time
  };
}
