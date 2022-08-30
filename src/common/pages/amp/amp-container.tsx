import React, { PropsWithChildren } from "react";
import { PageProps } from "../common";
import { StaticNavbar } from "../../components/static";
import Meta from "../../components/meta";
import truncate from "../../util/truncate";
import { Moment } from "moment";
import Theme from "../../components/theme";
import { Global } from "../../store/global/types";

interface Props {
  meta: {
    title: string;
    description: string;
    url: string;
    canonicalUrl: string;
    image: string;
    published: Moment;
    modified: Moment;
    tag?: string;
    keywords?: string;
  };
  global: Global;
}

export const AmpContainer = (props: PropsWithChildren<PageProps & Props>) => {
  return (
    <>
      <Meta
        {...{
          title: `${truncate(props.meta.title, 67)}`,
          description: props.meta.description,
          url: props.meta.url,
          canonical: props.meta.canonicalUrl,
          image: props.meta.image,
          published: props.meta.published.toISOString(),
          modified: props.meta.modified.toISOString(),
          tag: props.meta.tag,
          keywords: props.meta.keywords
        }}
      />
      <Theme global={props.global} />
      <StaticNavbar fullVersionUrl={props.meta.url} />
      {props.children}
    </>
  );
};
