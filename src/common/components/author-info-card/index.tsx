import React, { useEffect, useState } from "react";
import { match } from "react-router";
import { getAccountFull } from "../../api/hive";
import accountReputation from "../../helper/account-reputation";
import { PageProps } from "../../pages/common";
import { Entry } from "../../store/entries/types";
import truncate from "../../util/truncate";
import BookmarkBtn from "../bookmark-btn";
import FavoriteBtn from "../favorite-btn";
import FollowControls from "../follow-controls";
import ProfileLink from "../profile-link";
import { Skeleton } from "../skeleton";
import UserAvatar from "../user-avatar";
import "./_index.scss";
interface MatchParams {
  category: string;
  permlink: string;
  username: string;
}
interface Props extends PageProps {
  match: match<MatchParams>;
  entry: Entry;
}

const AuthorInfoCard = (props: Props) => {
  const reputation = accountReputation(props?.entry?.author_reputation);
  const { username } = props?.match?.params;
  const author = username.replace("@", "");

  const [authorInfo, setAuthorInfo] = useState({
    name: "",
    about: ""
  });

  const [loading, setLoading] = useState(false);
  let _isMounted = false;

  useEffect(() => {
    _isMounted = true;
    !props?.global?.isMobile && getAuthorInfo();
    return () => {
      _isMounted = false;
    };
  }, []);

  // For fetching authors about and display name information
  const getAuthorInfo = async () => {
    setLoading(true);
    const _authorInfo = (await getAccountFull(author))?.profile;

    _isMounted &&
      setAuthorInfo({
        name: _authorInfo?.name || "",
        about: _authorInfo?.about || _authorInfo?.location || ""
      });
    setLoading(false);
  };

  return loading ? (
    <div className="avatar-fixed">
      <div className="d-flex align-items-center mb-3">
        <Skeleton className="avatar-skeleton rounded-[50%]" />
        <Skeleton className=" ml-2 text-skeleton" />
      </div>
      <Skeleton className="text-skeleton mb-2" />
      <Skeleton className="text-skeleton" />
    </div>
  ) : (
    <div className="avatar-fixed" id="avatar-fixed">
      <div className="first-line">
        <span className="avatar">
          {ProfileLink({
            ...props,
            username: props?.entry?.author,
            children: (
              <div className="author-avatar">
                <UserAvatar username={props?.entry?.author} size="medium" />
              </div>
            )
          })}
        </span>
        <span className="user-info">
          <div className="info-line-1">
            {ProfileLink({
              ...props,
              username: props?.entry?.author,
              children: (
                <div className="author notranslate">
                  <span className="author-name">
                    <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                      <span itemProp="name">{props?.entry?.author}</span>
                    </span>
                  </span>
                  {!isNaN(reputation) && <span className="author-reputation">({reputation})</span>}
                </div>
              )
            })}
          </div>
        </span>
      </div>
      <div className="second-line">
        <div className="entry-tag">
          <div className="name">{authorInfo?.name}</div>
          {authorInfo?.about && null !== authorInfo?.about && (
            <p className="description">{`${truncate(authorInfo?.about, 130)}`}</p>
          )}
        </div>
      </div>
      <div className="social-wrapper">
        {props?.entry?.author && (
          <FollowControls {...props} targetUsername={props?.entry.author} where={"author-card"} />
        )}

        {props?.global?.usePrivate &&
          props?.entry?.author &&
          props?.entry?.author !== props.activeUser?.username && (
            <FavoriteBtn {...props} targetUsername={props?.entry.author} />
          )}

        {props?.global?.usePrivate &&
          BookmarkBtn({
            ...props,
            entry: props?.entry
          })}
      </div>
    </div>
  );
};

export default AuthorInfoCard;
