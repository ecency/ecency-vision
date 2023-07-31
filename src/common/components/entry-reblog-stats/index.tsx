import React, { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap';
import { _t } from '../../i18n';
import ProfileLink from '../profile-link';
import UserAvatar from '../user-avatar';
import LinearProgress from '../linear-progress';

const EntryRebloStats = (props: any) => {
  const limit = 30
    const { hideReblogs, showReblogStats, rebloggedBy, inProgress} = props;
    const [searchedText, setSearchedText] = useState("");
    const [loadLimit, setLoadLimit] = useState(10)

    const loadMore = () => {
      setLoadLimit(prev => prev + limit)
    }

    const reblogLists = (
      <>
        {inProgress && <LinearProgress/>}
        <div className="voters-list d-flex flex-column">
          <div className="list-body">
            {rebloggedBy.length > 0
              ? rebloggedBy?.slice(0, loadLimit).filter(
                (name: any) =>
                  name.toLowerCase().startsWith(searchedText) ||
                  name.toLowerCase().includes(searchedText)
              ).map((username: string) => {
                  return (
                    <div className="list-item" key={username}>
                      <div className="item-main">
                      {ProfileLink({
                          ...props,
                          username,
                          children: <UserAvatar username={username} size="small" />
                        })}

                        <div className="item-info">
                          {ProfileLink({
                            ...props,
                            username,
                            children: <span className="item-name notranslate">{username}</span>
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
                : _t("communities.no-results")}
          </div>
            {rebloggedBy.length > limit && <Button className="align-self-center w-50 mt-3"
            onClick={loadMore}
            >{_t("g.load-more")}</Button>}
        </div>
      </>
    )
  return (
    <div>
        <Modal
            onHide={hideReblogs}
            show={showReblogStats}
            centered={true}
            size="lg"
            animation={false}
            className="entry-votes-modal px-3"
          >
            <Modal.Header closeButton={true} className="align-items-center px-0">
              <Modal.Title>{_t("entry-list-item.reblogs-list-title")}</Modal.Title>
            </Modal.Header>
            <Form.Group className="w-100 mb-3">
              <Form.Control
                type="text"
                placeholder={_t("friends.search-placeholder")}
                value={searchedText}
                onChange={(e) => {
                  setSearchedText(e.target.value);
                }}
              />
            </Form.Group>
            <Modal.Body className="px-0">
                {reblogLists}
            </Modal.Body>
          </Modal>
    </div>
  )
}

export default EntryRebloStats