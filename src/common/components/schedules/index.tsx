import React, { Component } from 'react';

import { History, Location } from 'history';

import moment from 'moment';

import { Form, FormControl, Modal } from 'react-bootstrap';

import { Global } from '../../store/global/types';
import { ActiveUser } from '../../store/active-user/types';
import { FullAccount } from '../../store/accounts/types';

import BaseComponent from '../base';
import UserAvatar from '../user-avatar';
import LinearProgress from '../linear-progress';
import PopoverConfirm from '../popover-confirm';
import Tooltip from '../tooltip';
import Tag from '../tag';
import { error } from '../feedback';

import { _t } from '../../i18n';

import { getSchedules, Schedule, deleteSchedule, moveSchedule } from '../../api/private-api';

import accountReputation from '../../helper/account-reputation';

import defaults from '../../constants/defaults.json';

import {
  deleteForeverSvg,
  timeSvg,
  checkAllSvg,
  alertCircleSvg,
  textBoxOutline
} from '../../img/svg';

import { catchPostImage, postBodySummary, setProxyBase } from '@ecency/render-helper';

setProxyBase(defaults.imageServer);

interface ItemProps {
  history: History;
  global: Global;
  post: Schedule;
  activeUser: ActiveUser;
  deleteFn: (item: Schedule) => void;
  moveFn: (item: Schedule) => void;
}

export class ListItem extends Component<ItemProps> {
  render() {
    const { activeUser, post, deleteFn, moveFn, global } = this.props;

    const fallbackImage = global.isElectron
      ? './img/fallback.png'
      : require('../../img/fallback.png');
    const noImage = global.isElectron ? './img/noimage.svg' : require('../../img/noimage.svg');

    if (!activeUser.data.__loaded) {
      return null;
    }

    const account = activeUser.data as FullAccount;

    const author = account.name;
    const reputation = account.reputation;

    const tag = post.tags_arr[0];

    const img =
      catchPostImage(post.body, 600, 500, global.canUseWebp ? 'webp' : 'match') || noImage;
    const summary = postBodySummary(post.body, 200);

    const date = moment(post.schedule);
    const dateRelative = date.fromNow();
    const dateRelativeShort = date.fromNow(true);
    const dateFormatted = date.format('YYYY-MM-DD HH:mm');

    return (
      <div className="schedules-list-item">
        <div className="item-header">
          <div className="item-header-main">
            <div className="author-part">
              <a className="author-avatar">
                {UserAvatar({ ...this.props, username: author, size: 'medium' })}
              </a>
              <a className="author">
                {author}
                <span className="author-reputation">{accountReputation(reputation)}</span>
              </a>
            </div>
            {Tag({
              ...this.props,
              tag,
              type: 'span',
              children: <a className="category">{tag}</a>
            })}
            {post.status === 3 && (
              <span className="date" title={dateFormatted}>
                {dateRelativeShort}
              </span>
            )}
          </div>
        </div>
        <div className="item-body">
          <div className="item-image">
            <div>
              <img
                alt={post.title}
                src={img}
                onError={(e: React.SyntheticEvent) => {
                  const target = e.target as HTMLImageElement;
                  target.src = fallbackImage;
                }}
                className={img === noImage ? 'no-img' : ''}
              />
            </div>
          </div>
          <div className="item-summary">
            <div className="item-title">{post.title}</div>
            <div className="item-body">{summary}</div>
          </div>
          <div className="item-controls">
            {(() => {
              if (post.status === 1) {
                return (
                  <Tooltip content={dateRelative}>
                    <span className="post-status">
                      {timeSvg} {dateFormatted}
                    </span>
                  </Tooltip>
                );
              }

              if (post.status === 2) {
                return (
                  <Tooltip content={dateRelative}>
                    <span className="post-status status-postponed">
                      {timeSvg} {dateFormatted}
                    </span>
                  </Tooltip>
                );
              }

              if (post.status === 3) {
                return <span className="post-status status-published">{checkAllSvg}</span>;
              }

              if (post.status === 4) {
                return <span className="post-status status-error">{alertCircleSvg}</span>;
              }

              return <span />;
            })()}

            <div className="btn-controls">
              <PopoverConfirm
                titleText={`${_t('schedules.move')}?`}
                onConfirm={() => {
                  moveFn(post);
                }}
              >
                <a className="btn-move">
                  <Tooltip content={_t('schedules.move')}>
                    <span>{textBoxOutline}</span>
                  </Tooltip>
                </a>
              </PopoverConfirm>

              <PopoverConfirm
                onConfirm={() => {
                  deleteFn(post);
                }}
              >
                <a className="btn-delete">
                  <Tooltip content={_t('g.delete')}>
                    <span>{deleteForeverSvg}</span>
                  </Tooltip>
                </a>
              </PopoverConfirm>
            </div>
          </div>
        </div>

        {(() => {
          if (!post.message) {
            return null;
          }

          if (post.status === 2) {
            return <div className="message-warning">{post.message}</div>;
          }

          if (post.status === 4) {
            return <div className="message-error">{post.message}</div>;
          }

          return null;
        })()}
      </div>
    );
  }
}

interface Props {
  global: Global;
  history: History;
  location: Location;
  activeUser: ActiveUser;
  onHide: () => void;
}

interface State {
  loading: boolean;
  list: Schedule[];
  filter: string;
}

export class Schedules extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    list: [],
    filter: ''
  };

  componentDidMount() {
    this.fetch();
  }

  fetch = () => {
    const { activeUser } = this.props;

    this.stateSet({ loading: true });
    getSchedules(activeUser.username)
      .then((items) => {
        this.stateSet({ list: this.sort(items) });
      })
      .catch(() => {
        error(_t('g.server-error'));
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  sort = (items: Schedule[]) =>
    items.sort((a, b) => {
      return new Date(b.schedule).getTime() > new Date(a.schedule).getTime() ? 1 : -1;
    });

  delete = (item: Schedule) => {
    const { activeUser } = this.props;

    deleteSchedule(activeUser.username, item._id)
      .then((resp) => {
        this.stateSet({ list: this.sort(resp) });
      })
      .catch(() => {
        error(_t('g.server-error'));
      });
  };

  move = (item: Schedule) => {
    const { activeUser } = this.props;

    moveSchedule(activeUser.username, item._id)
      .then((resp) => {
        this.stateSet({ list: resp });
      })
      .catch(() => {
        error(_t('g.server-error'));
      });
  };

  filterChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value } = e.target;
    this.stateSet({ filter: value });
  };

  render() {
    const { list, filter, loading } = this.state;

    return (
      <div className="dialog-content">
        {(() => {
          if (loading) {
            return <LinearProgress />;
          }

          if (list.length === 0) {
            return <div className="schedules-list">{_t('g.empty-list')}</div>;
          }

          const items = list.filter(
            (x) => x.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1
          );

          return (
            <>
              <div className="dialog-filter">
                <Form.Control
                  type="text"
                  placeholder={_t('drafts.filter')}
                  value={filter}
                  onChange={this.filterChanged}
                />
              </div>

              {items.length === 0 && <span className="text-muted">{_t('g.no-matches')}</span>}

              {items.length > 0 && (
                <div className="schedules-list">
                  <div className="schedules-list-body">
                    {items.map((item) => (
                      <ListItem
                        key={item._id}
                        {...this.props}
                        post={item}
                        moveFn={this.move}
                        deleteFn={this.delete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    );
  }
}

export default class SchedulesDialog extends Component<Props> {
  hide = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    return (
      <Modal show={true} centered={true} onHide={this.hide} size="lg" className="schedules-modal">
        <Modal.Header closeButton={true}>
          <Modal.Title>{_t('schedules.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Schedules {...this.props} />
        </Modal.Body>
      </Modal>
    );
  }
}
