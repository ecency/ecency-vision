import { pathToRegexp } from "path-to-regexp";
import defaults from "@/defaults.json";
import { ProfileFilter } from "@/enums";
import routes from "@/routes";

type FilterTag = {
  filter: string;
  tag: string;
};

export function extractFilterTag(location: string): FilterTag | null {
  if (location === routes.HOME || location === routes.PURCHASE) {
    return {
      filter: defaults.filter,
      tag: ""
    };
  }

  if (/[A-Z]/.test(location)) {
    location = location.toLowerCase();
  }

  let re = pathToRegexp(routes.FILTER);
  let params = re.exec(location);
  if (params && params[1]) {
    return {
      filter: params[1],
      tag: ""
    };
  }

  re = pathToRegexp(routes.FILTER_TAG);
  params = re.exec(location);
  if (params && params[1] && params[2]) {
    return {
      filter: params[1],
      tag: params[2]
    };
  }

  re = pathToRegexp(routes.USER);
  params = re.exec(location);
  if (params && params[1]) {
    return {
      filter: ProfileFilter.blog,
      tag: params[1]
    };
  }

  re = pathToRegexp(routes.USER_FEED);
  params = re.exec(location);
  if (params && params[1] && params[2]) {
    return {
      filter: params[2],
      tag: params[1]
    };
  }

  re = pathToRegexp(routes.USER_SECTION);
  params = re.exec(location);
  if (params && params[1] && params[2] && Object.keys(ProfileFilter).includes(params[2])) {
    return {
      filter: params[2],
      tag: params[1]
    };
  }

  return null;
}
