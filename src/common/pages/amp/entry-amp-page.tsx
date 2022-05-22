import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from '../common';
import { AmpContainer } from './amp-container';
import truncate from '../../util/truncate';
import { catchPostImage, postBodySummary, renderPostBody } from '@ecency/render-helper';
import isCommunity from '../../helper/is-community';
import { Entry } from '../../store/entries/types';
import entryCanonical from '../../helper/entry-canonical';
import moment from 'moment';
import parseDate from '../../helper/parse-date';
import dmca from '../../constants/dmca.json';
import NotFound from '../../components/404';
import * as bridgeApi from '../../api/bridge';
import { commentHistory } from '../../api/private-api';
import { error } from '../../components/feedback';
import { _t } from '../../i18n';
import Tag from '../../components/tag';
import { crossPostMessage } from '../../helper/cross-post';
import { Tsx } from '../../i18n/helper';
import accountReputation from '../../helper/account-reputation';
import { Link } from 'react-router-dom';
import { makePath as makeEntryPath } from '../../components/entry-link';
import ProfileLink from '../../components/profile-link';
import UserAvatar from '../../components/user-avatar';
import appName from '../../helper/app-name';
import EntryLink from '../../components/entry-link';
import SimilarEntries from '../../components/similar-entries';
import Discussion from '../../components/discussion';
import { Community } from '../../store/communities/types';
import replaceLinkIdToDataId from '../../util/replace-link-id-to-data-id';

interface Props {
  match: {
    params: {
      username: string;
      permlink: string;
      category: string;
    };
  };
}

const EntryAmpPage = (props: PageProps & Props) => {
  const [entry, setEntry] = useState<Entry>();
  const [deletedEntry, setDeletedEntry] = useState<object>();
  const [tags, setTags] = useState<string[]>();
  const [reputation, setReputation] = useState(0);

  useEffect(() => {
    ensureEntry();
  }, []);

  const getEntry = (): Entry | undefined => {
    const { entries, match } = props;
    const { username, permlink } = match.params;
    const author = username.replace('@', '');

    const groupKeys = Object.keys(entries);
    let entry: Entry | undefined = undefined;

    for (const k of groupKeys) {
      entry = entries[k].entries.find((x) => x.author === author && x.permlink === permlink);
      if (entry) {
        if (dmca.some((rx: string) => new RegExp(rx).test(`${entry?.author}/${entry?.permlink}`))) {
          entry.body = 'This post is not available due to a copyright/fraudulent claim.';
          entry.title = '';
        }
        break;
      }
    }

    return entry;
  };

  const ensureEntry = async () => {
    const { match, addEntry, updateEntry, addCommunity, activeUser, history } = props;
    const entry = getEntry();
    const { category, username, permlink } = match.params;
    const author = username.replace('@', '');


    let reducerFn = updateEntry;

    if (!entry) {
      reducerFn = addEntry;
    } else {
      const updated = moment.utc(entry.updated);
      const now = moment.utc(Date.now())

      const diffMs = now.diff(updated);
      const duration = moment.duration(diffMs);
      if (duration.asSeconds() < 10) {
        // don't re-fetch recently updated post.
        return;
      }
    }

    try {
      const instance = await bridgeApi.getPost(author, permlink);
      if (instance) {
        setEntry(instance);
        let tags = instance.json_metadata.tags && [...new Set(instance.json_metadata.tags)];
        // If category is not present in tags then add
        if (instance.category && tags && tags[0] !== instance.category) {
          tags.splice(0, 0, instance.category);
        }
        setTags(tags);
        setReputation(instance.author_reputation);
        reducerFn(instance);
      }

      if (isCommunity(category)) {
        const community = await bridgeApi.getCommunity(category, activeUser?.username);
        community ? addCommunity(community) : null;
      }
    } catch (e) {
      let errorMessage = e.jse_info;
      let arr = [];
      for (let p in errorMessage) arr.push(errorMessage[p]);
      errorMessage = arr.toString().replace(/,/g, '');
      if (errorMessage?.length > 0 && errorMessage?.includes('was deleted')) {
        await loadDeletedEntry(author, permlink);
      }
    }
  };

  const loadDeletedEntry = async (author: string, permlink: string) => {
    try {
      const resp = await commentHistory(author, permlink);
      setDeletedEntry({ body: resp.list[0].body, title: resp.list[0].title, tags: resp.list[0].tags });
    } catch (e) {
      error(_t('g.server-error'));
    }
  };

  const getCommunity = (): Community | null => {
    const { communities, match } = props;
    const { category } = match.params;
    return communities.find((x) => x.name === category) || null;
  }

  const getTags = () => tags?.map((t, i) => {
    if (typeof t === 'string') {
      if (entry!!.community && entry!!.community_title && t === entry!!.community) {
        return <Fragment key={t + i}>
          {Tag({
            ...props,
            tag: {
              name: entry!!.community,
              title: entry!!.community_title
            },
            type: 'link',
            children: <div className="entry-tag">{t}</div>
          })}
        </Fragment>
      }

      return (
        <Fragment key={t + i}>
          {Tag({
            ...props,
            tag: t.trim(),
            type: 'link',
            children: <div className="entry-tag">{t}</div>
          })}
        </Fragment>
      )
    }
    return <></>
  });

  const getEntryBody = () => {
    if (!entry) {
      return <></>
    }

    if (entry.json_metadata.tags?.includes('nsfw')) {
      return <div className="nsfw-warning">
        <div className="nsfw-title"><span className="nsfw-badge">NSFW</span></div>
        <div className="nsfw-body">
          <a href={entry.url}>{_t('nsfw.reveal')}</a>
          {' '} {_t('g.or').toLowerCase()} {' '}
          <Tsx k="nsfw.signup"><span/></Tsx>{'.'}
        </div>
      </div>
    }

    const originalEntry = entry?.original_entry;
    // Cross post body
    if (originalEntry) {
      const published = moment(parseDate(originalEntry.created));
      const reputation = accountReputation(originalEntry.author_reputation);
      const renderedBody = { __html: renderPostBody(originalEntry.body, false, props.global.canUseWebp) };

      return <>
        <div className="entry-header">
          <h1 className="entry-title">
            {originalEntry.title}
          </h1>
          <div className="entry-info">
            {ProfileLink({
              ...props,
              username: originalEntry.author,
              children: <div className="author-avatar">{UserAvatar({
                ...props,
                username: originalEntry.author,
                size: 'medium'
              })}</div>
            })}

            <div className="entry-info-inner">
              <div className="info-line-1">
                <ProfileLink {...{ ...props, username: originalEntry.author }}>
                  <div className="author notranslate">
                    <span className="author-name">
                      <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                        <span itemProp="name">{originalEntry.author}</span>
                      </span>
                    </span>
                    <span className="author-reputation" title={_t('entry.author-reputation')}>
                      {reputation}
                    </span>
                  </div>
                </ProfileLink>
              </div>

              <div className="info-line-2">
                <span className="date" title={published.format('LLLL')}>{published.fromNow()}</span>
                <span className="separator"/>
                <div className="entry-tag">
                  <span className="in-tag">{_t('entry.community-in')}</span>
                  {Tag({
                    ...props,
                    tag: originalEntry.category,
                    type: 'link',
                    children: <div className="tag-name">
                      {originalEntry.community ? originalEntry.community_title : `#${originalEntry.category}`}
                    </div>
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div itemProp="articleBody" className="entry-body markdown-view user-selectable"
             dangerouslySetInnerHTML={renderedBody} onMouseUp={(e) => {
        }}/>
      </>;
    }

    const communityTitle = entry.community ? entry.community_title : '';
    const isHidden = entry?.net_rshares < -500000000;
    const isMuted = entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation >= 0;
    const isLowReputation = entry?.stats?.gray && entry?.net_rshares >= 0 && entry?.author_reputation < 0;
    const published = moment(parseDate(entry.created));
    const app = appName(entry.json_metadata.app);
    const appShort = app.split('/')[0].split(' ')[0];

    const body = replaceLinkIdToDataId(entry.body);
    let renderedBody = { __html: renderPostBody(body, false, props.global.canUseWebp) };

    return <>
      <div className="entry-header">
        {isMuted && (<div className="hidden-warning">
          <span><Tsx k="entry.muted-warning" args={{ community: communityTitle }}><span/></Tsx></span>
        </div>)}

        {isHidden && (<div className="hidden-warning">
          <span>{_t('entry.hidden-warning')}</span>
        </div>)}

        {isLowReputation && (<div className="hidden-warning">
          <span>{_t('entry.lowrep-warning')}</span>
        </div>)}

        {!!entry.parent_author && (
          <div className="comment-entry-header">
            <div className="comment-entry-header-title">RE: {entry.title}</div>
            <div className="comment-entry-header-info">{_t('entry.comment-entry-title')}</div>
            <p className="comment-entry-root-title">{entry.title}</p>
            <ul className="comment-entry-opts">
              <li>
                <Link to={entry.url}>{_t('entry.comment-entry-go-root')}</Link>
              </li>
              {entry.depth > 1 && (
                <li>
                  <Link to={makeEntryPath(entry.category, entry.parent_author!, entry.parent_permlink!)}>
                    {_t('entry.comment-entry-go-parent')}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        )}
        <h1 className="entry-title">
          {entry.title}
        </h1>
        <div className="entry-info">
          <ProfileLink {...{ ...props, username: entry.author }}>
            <div className="author-avatar">
              <UserAvatar {...{
                ...props,
                username: entry.author,
                size: 'medium'
              }} />
            </div>
          </ProfileLink>

          <div className="entry-info-inner">
            <div className="info-line-1">
              <ProfileLink {...{ ...props, username: entry.author }}>
                <div className="author notranslate">
                  <span className="author-name">
                    <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                      <span itemProp="name">{entry.author}</span>
                    </span>
                  </span>
                  <span className="author-reputation" title={_t('entry.author-reputation')}>
                    {reputation}
                  </span>
                </div>
              </ProfileLink>
            </div>

            <div className="info-line-2">
              <span className="date" title={published.format('LLLL')}>{published.fromNow()}</span>
              <span className="separator"/>
              <div className="entry-tag">
                <span className="in-tag">{_t('entry.community-in')}</span>
                {Tag({
                  ...props,
                  tag: entry.category,
                  type: 'link',
                  children: <div className="tag-name">
                    {entry.community ? entry.community_title : `#${entry.category}`}
                  </div>
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <meta itemProp="headline name" content={entry.title}/>
      <div
        itemProp="articleBody"
        className="entry-body markdown-view user-selectable"
        dangerouslySetInnerHTML={renderedBody}
      />

      <div className="entry-footer">
        <div className="entry-tags">{getTags()}</div>
        <div className="entry-info">
          <div className="date" title={published.format('LLLL')}>
            {published.fromNow()}
          </div>
          <span className="separator"/>
          {ProfileLink({
            ...props,
            username: entry.author,
            children: <div className="author notranslate">
              <span className="author-name">{entry.author}</span>
              <span className="author-reputation" title={_t('entry.author-reputation')}>{reputation}</span>
            </div>
          })}
          {app && (
            <>
              <span className="separator"/>
              <span itemProp="publisher" itemScope={true} itemType="http://schema.org/Person">
                <meta itemProp="name" content={entry.author}/>
              </span>
              <div className="app" title={app}>
                <Tsx k="entry.via-app" args={{ app: appShort }}><a href="/faq#source-label"/></Tsx>
              </div>
            </>
          )}
        </div>

        {originalEntry && (
          <div className="browse-original">
            {EntryLink({
              ...props,
              entry: originalEntry,
              children: <a className="btn btn-primary">
                {_t('entry.browse-original')}
              </a>
            })}
          </div>
        )}

        {(!originalEntry && !entry.parent_author) && SimilarEntries({
          ...props,
          entry,
          display: ''
        })}

        {Discussion({ ...props, parent: entry, community: getCommunity(), hideControls: true })}
      </div>
    </>
  };

  return entry ? <AmpContainer {...{
    ...props,
    meta: {
      title: `${truncate(entry.title, 67)}`,
      description: `${truncate(postBodySummary(entry.body, 210), 140)} by @${entry.author}`,
      url: entry.url,
      canonicalUrl: entryCanonical(entry) || '',
      image: catchPostImage(entry, 600, 500, props.global.canUseWebp ? 'webp' : 'match'),
      published: moment(parseDate(entry.created)),
      modified: moment(parseDate(entry.updated)),
      tag: tags ? isCommunity(tags[0]) ? tags[1] : tags[0] : '',
      keywords: tags && tags.join(', ')
    }
  }}>
    <div className="app-content entry-page">
      <div className="the-entry">
        {!!entry.original_entry && (
          <div className="cross-post">
            <div className="cross-post-info">
              {_t('entry.cross-post-by')}
              {ProfileLink({
                ...props,
                username: entry.author,
                children: <div className="cross-post-author">
                  {UserAvatar({ ...props, username: entry.author, size: 'medium' })}
                  {`@${entry.author}`}
                </div>
              })}
            </div>
            <div className="cross-post-community">
              {Tag({
                ...props,
                tag: entry.category,
                type: 'link',
                children: <div className="community-link">{entry.community_title}</div>
              })}
              {_t('entry.cross-post-community')}
            </div>
            <div className="cross-post-message">{'"'}{crossPostMessage(entry.body)}{'"'}</div>
          </div>
        )}
        <div itemScope={true} itemType="http://schema.org/Article">
          {getEntryBody()}
        </div>
      </div>
    </div>
  </AmpContainer> : NotFound({ ...props })
}
export default connect(pageMapStateToProps, pageMapDispatchToProps)(EntryAmpPage);