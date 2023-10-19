export const AVAILABLE_THREAD_HOSTS: string[] = [
  ...(process.env.NODE_ENV === "development" ? ["testhreads"] : []),
  "ecency.waves",
  "leothreads",
  "dbuzz"
];
