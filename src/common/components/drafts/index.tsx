import React, { Component } from "react";
import { History, Location } from "history";
import { Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import { error, success } from "../feedback";
import { _t } from "../../i18n";
import { addDraft, deleteDraft, Draft, DraftMetadata, getDrafts } from "../../api/private-api";
import defaults from "../../constants/defaults.json";
import { setProxyBase } from "@ecency/render-helper";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { DraftListItem } from "./draft-list-item";

setProxyBase(defaults.imageServer);

interface Props {
  global: Global;
  history: History;
  location: Location;
  activeUser: ActiveUser;
  onHide: () => void;
  onPick?: (url: string) => void;
}

interface State {
  loading: boolean;
  list: Draft[];
  filter: string;
  innerRef: any;
  listRef: any;
  isClone: boolean;
}

export class Drafts extends BaseComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      list: [],
      filter: "",
      innerRef: React.createRef(),
      listRef: React.createRef(),
      isClone: false
    };
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      this.state.loading !== prevState.loading &&
      !this.state.loading &&
      this.state.list.length > 0
    ) {
      this.state!.innerRef!.current && this.state!.innerRef!.current!.focus();
    }
  }

  fetch = () => {
    const { activeUser } = this.props;

    this.stateSet({ loading: true });
    getDrafts(activeUser?.username!)
      .then((items) => {
        this.stateSet({ list: this.sort(items) });
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  sort = (items: Draft[]) =>
    items.sort((a, b) => {
      return new Date(b.created).getTime() > new Date(a.created).getTime() ? 1 : -1;
    });

  delete = (item: Draft) => {
    const { activeUser, location, history } = this.props;

    deleteDraft(activeUser?.username!, item._id)
      .then(() => {
        const { list } = this.state;
        const nList = [...list].filter((x) => x._id !== item._id);

        this.stateSet({ list: this.sort(nList) });

        // if user editing the draft, redirect to submit page
        if (location.pathname === `/draft/${item._id}`) {
          history.push("/submit");
        }
      })
      .catch(() => {
        error(_t("g.server-error"));
      });
  };

  edit = (item: Draft) => {
    const { history, onHide } = this.props;

    history.push(`/draft/${item._id}`);
    onHide();
  };

  clone = async (item: Draft) => {
    const element = this.state.listRef.current;
    this.setState({ isClone: true });
    const { activeUser } = this.props;
    const { title, body, tags, meta } = item;
    const cloneTitle = _t("g.copy") + " " + title;
    const draftMeta: DraftMetadata = meta!;
    try {
      const resp = await addDraft(activeUser?.username!, cloneTitle, body, tags, draftMeta);
      this.stateSet({ list: this.sort(resp.drafts), isClone: false });
      success(_t("g.clone-success"));
      element.scrollIntoView(true);
    } catch (err) {
      this.setState({ isClone: false });
      error(_t("g.server-error"));
    }
  };
  filterChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    this.stateSet({ filter: value });
  };

  render() {
    const { list, filter, loading, isClone } = this.state;

    return (
      <div className="dialog-content">
        {(() => {
          if (loading) {
            return <LinearProgress />;
          }

          if (list.length === 0) {
            return <div className="drafts-list">{_t("g.empty-list")}</div>;
          }

          const items = list.filter(
            (x) => x.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1
          );

          return (
            <>
              <div className="dialog-filter">
                <FormControl
                  ref={this.state.innerRef}
                  type="text"
                  placeholder={_t("drafts.filter")}
                  value={filter}
                  onChange={this.filterChanged}
                />
              </div>
              {isClone && <LinearProgress />}
              {items.length === 0 && <span className="text-gray-600">{_t("g.no-matches")}</span>}

              {items.length > 0 && (
                <div className="drafts-list">
                  <div className="flex flex-col gap-4 my-4" ref={this.state.listRef}>
                    {items.map((item) => (
                      <DraftListItem
                        key={item._id}
                        {...this.props}
                        draft={item}
                        editFn={this.edit}
                        deleteFn={this.delete}
                        cloneFn={this.clone}
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

class DraftsDialog extends Component<Props> {
  hide = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    return (
      <Modal show={true} centered={true} onHide={this.hide} size="lg" className="drafts-modal">
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("drafts.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Drafts {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}

export default ({ history, onHide }: Pick<Props, "history" | "onHide">) => {
  const { global, activeUser } = useMappedStore();
  const location = useLocation();

  return (
    <DraftsDialog
      global={global}
      history={history}
      location={location}
      activeUser={activeUser!!}
      onHide={onHide}
    />
  );
};
