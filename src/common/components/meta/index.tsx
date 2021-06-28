import React, { Component } from "react";

import { Helmet } from "react-helmet";

import defaults from "../../constants/defaults.json";

interface Props {
  title?: string;
  description?: string;
  url?: string;
  canonical?: string;
  tag?: string;
  keywords?: string;
  image?: string;
  published?: string;
  modified?: string;
  rss?: string;
}

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const title_ = (s: string): string => `${s} | ${capitalize(defaults.name)}`;

export default class Meta extends Component<Props> {
  render() {
    const { title, description, url, canonical, tag, keywords, published, modified, rss } = this.props;
    let { image } = this.props;

    if (!image) {
      image = `${defaults.base}/placeholder.jpg`;
    }

    return (
      <>
        <Helmet>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <meta property="og:site_name" content={defaults.name} />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content={defaults.twitterHandle} />
        </Helmet>

        {title && (
          <Helmet>
            <title>{title}</title>
            <meta property="og:title" content={title} />
            <meta name="twitter:title" content={title} />
          </Helmet>
        )}

        {!title && (
          <Helmet>
            <title>{defaults.title}</title>
            <meta property="og:title" content={defaults.title} />
            <meta name="twitter:title" content={defaults.title} />
          </Helmet>
        )}

        {description && (
          <Helmet>
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
            <meta name="twitter:description" content={description} />
          </Helmet>
        )}

        {!description && (
          <Helmet>
            <meta name="description" content={defaults.description} />
            <meta property="og:description" content={defaults.description} />
            <meta name="twitter:description" content={defaults.description} />
          </Helmet>
        )}

        {url && (
          <Helmet>
            <meta property="og:url" content={`${defaults.base}${url}`} />
            <meta itemProp="mainEntityOfPage" itemScope={true} itemType="http://schema.org/WebPage" itemID={`${defaults.base}${url}`}/>
          </Helmet>
        )}

        {canonical && (
          <Helmet>
            <link rel="canonical" href={canonical} />
          </Helmet>
        )}

        {tag && (
          <Helmet>
            <meta name="article:tag" content={tag} />
          </Helmet>
        )}

        {keywords && (
          <Helmet>
            <meta name="keywords" content={keywords} />
          </Helmet>
        )}

        {published && (
          <Helmet>
            <meta name="article:published_time" content={published} />
            <meta itemProp="datePublished" content={published} />
          </Helmet>
        )}

        {modified && (
          <Helmet>
            <meta itemProp="dateModified" content={modified} />
          </Helmet>
        )}

        {rss && (
          <Helmet>
            <link rel="alternate" type="application/rss+xml" href={rss} />
          </Helmet>
        )}

        <Helmet>
          <meta property="og:image" content={image} />
          <meta name="twitter:image" content={image} />
        </Helmet>
      </>
    );
  }
}
