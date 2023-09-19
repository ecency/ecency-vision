import ScrollToTop from "../../components/scroll-to-top";
import Theme from "../../components/theme";
import AuthorInfoCard from "../../components/author-info-card";
import { _t } from "../../i18n";
import { renderPostBody } from "@ecency/render-helper";
import React from "react";
import NavBarElectron from "../../../desktop/app/components/navbar";
import NavBar from "../../components/navbar";
import { Props } from "./props.type";
import EditHistory from "../../components/edit-history";
import SimilarEntries from "../../components/similar-entries";
import { StaticNavbar } from "../../components/static";

interface DeletedPostProps {
  reload: () => void;
  loading: boolean;
  deletedEntry: {
    title: string;
    body: string;
    tags: any;
  };
  showProfileBox: boolean;
  editHistory: boolean;
  toggleEditHistory: () => void;
  staticNav?: boolean;
}

export const DeletedPostScreen = (props: Props & DeletedPostProps) => {
  const nav = props.global.isElectron ? (
    NavBarElectron({
      ...props,
      reloadFn: props.reload,
      reloading: props.loading
    })
  ) : (
    <NavBar history={props.history} match={props.match} />
  );
  const staticNav = <StaticNavbar fullVersionUrl="" />;

  return (
    <div>
      {props.staticNav ? staticNav : nav}
      {props.deletedEntry && (
        <div className="container overflow-x-hidden">
          <ScrollToTop />
          <Theme global={props.global} />
          <div className="row">
            <div className="col-0 col-lg-2 mt-5">
              <div className="mb-4 mt-5">
                <div id="avatar-fixed-container" className="invisible">
                  {!props.global.isMobile && props.showProfileBox && (
                    <AuthorInfoCard
                      {...props}
                      entry={{ author: props.match.params.username.replace("@", "") } as any}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-9">
              <div className="p-0 p-lg-5 the-entry">
                <div className="p-3 bg-danger rounded text-white my-0 mb-4 my-lg-5">
                  {_t("entry.deleted-content-warning")}
                  <u onClick={props.toggleEditHistory} className="text-blue-dark-sky pointer">
                    {_t("points.history")}
                  </u>{" "}
                  {_t("g.logs")}.
                </div>
                <div className="cross-post">
                  <h1 className="entry-title">{props.deletedEntry!.title}</h1>
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: renderPostBody(props.deletedEntry!.body) }}
                />
                {props.editHistory && (
                  <EditHistory
                    entry={
                      {
                        author: props.match.params.username.replace("@", ""),
                        permlink: props.match.params.permlink
                      } as any
                    }
                    onHide={props.toggleEditHistory}
                  />
                )}
                <div className="mt-3">
                  {SimilarEntries({
                    ...props,
                    entry: {
                      permlink: props.match.params.permlink,
                      author: props.match.params.username.replace("@", ""),
                      json_metadata: { tags: props.deletedEntry.tags }
                    } as any,
                    display: ""
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
