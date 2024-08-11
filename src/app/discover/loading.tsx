import { useMemo } from "react";

export default function Loading() {
  const items = useMemo(() => new Array(24).fill(1), []);

  return (
    <div className="app-content discover-page">
      <div className="top-users">
        <div className="leaderboard-list">
          <div className="list-header">
            <div className="list-filter">
              <div className="w-[100px] rounded animate-pulse h-[27px] bg-white dark:bg-blue-dark-grey" />
            </div>
            <div className="list-title">
              <div className="w-[100px] rounded animate-pulse h-[24px] bg-white dark:bg-blue-dark-grey" />
            </div>
          </div>
          <div className="list-body overflow-hidden">
            {items.map((_, i) => (
              <div key={i} className="flex items-center gap-2 mb-4">
                <div className="w-[30px] rounded animate-pulse h-[20px] bg-white dark:bg-blue-dark-grey" />
                <div className="min-w-[40px] rounded-full animate-pulse h-[40px] bg-white dark:bg-blue-dark-grey" />
                <div className="w-full rounded animate-pulse h-[18px] bg-white dark:bg-blue-dark-grey" />
                <div className="w-[40px] rounded animate-pulse h-[23px] bg-white dark:bg-blue-dark-grey" />
                <div className="w-[130px] rounded animate-pulse h-[20px] bg-white dark:bg-blue-dark-grey" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="curation-users">
        <div className="leaderboard-list">
          <div className="list-header">
            <div className="list-filter">
              <div className="w-[100px] rounded animate-pulse h-[27px] bg-white dark:bg-blue-dark-grey" />
            </div>
            <div className="list-title">
              <div className="w-[100px] rounded animate-pulse h-[24px] bg-white dark:bg-blue-dark-grey" />
            </div>
          </div>
          <div className="list-body overflow-hidden">
            {items.map((_, i) => (
              <div key={i} className="flex items-center gap-2 mb-4">
                <div className="w-[30px] rounded animate-pulse h-[20px] bg-white dark:bg-blue-dark-grey" />
                <div className="min-w-[40px] rounded-full animate-pulse h-[40px] bg-white dark:bg-blue-dark-grey" />
                <div className="w-full rounded animate-pulse h-[18px] bg-white dark:bg-blue-dark-grey" />
                <div className="w-[40px] rounded animate-pulse h-[23px] bg-white dark:bg-blue-dark-grey" />
                <div className="w-[130px] rounded animate-pulse h-[20px] bg-white dark:bg-blue-dark-grey" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="popular-users">
        <div className="discover-contributors-list">
          <div className="list-header">
            <div className="list-filter">
              <div className="w-[100px] rounded animate-pulse h-[27px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
            </div>
            <div className="list-title">
              <div className="w-[100px] rounded animate-pulse h-[24px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
            </div>
          </div>
          <div className="list-body overflow-hidden">
            {items.map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="min-w-[40px] rounded-full animate-pulse h-[40px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                <div className="w-full">
                  <div className="w-full rounded animate-pulse h-[27px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                  <div className="w-full rounded animate-pulse h-[19px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                  <div className="w-full rounded animate-pulse h-[20px] bg-blue-dark-sky-040 dark:bg-blue-dark-grey" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
