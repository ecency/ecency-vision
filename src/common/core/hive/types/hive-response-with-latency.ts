export interface HiveResponseWithLatency<T> {
  response: T;
  latency: number;
}
