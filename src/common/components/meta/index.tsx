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
  rss?: string;
}

const title_ = (s: string): string => `${s} - ecency`;

export default class Meta extends Component<Props> {
  render() {
    const { title, description, url, canonical, tag, keywords } = this.props;
    let { image } = this.props;

    if (!image) {
      image = `${defaults.base}/og.jpg`;
    }

    return (
      <>
        <Helmet>
          <meta property="og:site_name" content="ecency" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@esteem_app" />
        </Helmet>

        {title && (
          <Helmet>
            <title>{title_(title)}</title>
            <meta property="og:title" content={title_(title)} />
            <meta name="twitter:title" content={title_(title)} />
          </Helmet>
        )}

        {description && (
          <Helmet>
            <meta name="description" content={description} />
            <meta property="og:description" content={description} />
            <meta name="twitter:description" content={description} />
          </Helmet>
        )}

        {url && (
          <Helmet>
            <meta property="og:url" content={url} />
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

        <Helmet>
          <meta property="og:image" content={image} />
          <meta name="twitter:image" content={image} />
          <meta itemProp="image" content={image} />
        </Helmet>
      </>
    );
  }
}
