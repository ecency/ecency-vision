import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import moment, { Moment } from "moment/moment";
import { search } from "@/api/search-api";
import { SearchResponse } from "@/entities";

type PageParam = {
  sid: string | undefined;
};

export const getControversialRisingQuery = (what: string, tag: string, enabled = true) =>
  EcencyQueriesManager.generateClientServerInfiniteQuery({
    queryKey: [QueryIdentifiers.GET_POSTS_CONTROVERSIAL_OR_RISING, what, tag],
    queryFn: async ({ pageParam }: { pageParam: PageParam }) => {
      let sinceDate: Moment | undefined;

      switch (tag) {
        case "today":
          sinceDate = moment().subtract("1", "day");
          break;
        case "week":
          sinceDate = moment().subtract("1", "week");
          break;
        case "month":
          sinceDate = moment().subtract("1", "month");
          break;
        case "year":
          sinceDate = moment().subtract("1", "year");
          break;
        default:
          sinceDate = undefined;
      }
      let q = "* type:post";
      let sort = what === "rising" ? "children" : what;
      const since = sinceDate ? sinceDate.format("YYYY-MM-DDTHH:mm:ss") : undefined;
      const hideLow_ = "0";
      const votes = tag === "today" ? 50 : 200;

      return await search(q, sort, hideLow_, since, pageParam.sid, votes);
    },
    initialData: { pages: [], pageParams: [] },
    initialPageParam: { sid: undefined } as PageParam,
    getNextPageParam: ({ scroll_id }: SearchResponse) => {
      return {
        sid: scroll_id
      };
    },
    enabled
  });
