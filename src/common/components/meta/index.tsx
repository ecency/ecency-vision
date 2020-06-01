import React, { Component } from "react";

import { Helmet } from "react-helmet";

interface Props {
  title?: string;
  description?: string;
  keyword?: string;
  url?: string;
  tag?: string;
}

const title_ = (s: string): string => `${s} - ecency`;

export default class Meta extends Component<Props> {
  render() {
    const { title, description, url } = this.props;

    return (
      <>
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
            <link rel="canonical" href={url} />
          </Helmet>
        )}
      </>
    );
  }
}
