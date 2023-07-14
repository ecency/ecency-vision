import React, { useState } from 'react'
import { Form, Modal } from 'react-bootstrap';
import { _t } from '../../i18n';
import ProfileLink from '../profile-link';
import UserAvatar from '../user-avatar';
import LinearProgress from '../linear-progress';

const EntryRebloStats = (props: any) => {
    const { hideReblogs, showReblogStats, rebloggedBy, inProgress} = props;
    const [searchText, setSearchText] = useState("")

    const reblogLists = (
      <>
        {inProgress && <LinearProgress/>}
        <div className="voters-list">
          <div className="list-body">
            {rebloggedBy && rebloggedBy.length > 0
              ? rebloggedBy.map((username: string) => {
                  return (
                    <div className="list-item" key={username}>
                      <div className="item-main">
                        <ProfileLink {...props} username={username}>
                          <UserAvatar username={username} size="small" />
                        </ProfileLink>

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
              <Modal.Title>All Reblogs</Modal.Title>
            </Modal.Header>
            <Form.Group className="w-100 mb-3">
              <Form.Control
                type="text"
                placeholder={_t("friends.search-placeholder")}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
                // disabled={searchTextDisabled}
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