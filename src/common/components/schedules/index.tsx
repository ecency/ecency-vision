import React, { Component } from "react";

import { History, Location } from "history";
import { Global } from "../../store/global/types";
import { ActiveUser } from "../../store/active-user/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import { error } from "../feedback";

import { _t } from "../../i18n";

import { deleteSchedule, getSchedules, moveSchedule, Schedule } from "../../api/private-api";

import defaults from "../../constants/defaults.json";

import { setProxyBase } from "@ecency/render-helper";
import { useMappedStore } from "../../store/use-mapped-store";
import { useLocation } from "react-router";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { ScheduledListItem } from "./scheduled-list-item";

setProxyBase(defaults.imageServer);

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
  innerRef: any;
}

export class Schedules extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    list: [],
    filter: "",
    innerRef: React.createRef()
  };

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
    getSchedules(activeUser.username)
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
        error(_t("g.server-error"));
      });
  };

  move = (item: Schedule) => {
    const { activeUser } = this.props;

    moveSchedule(activeUser.username, item._id)
      .then((resp) => {
        this.stateSet({ list: resp });
      })
      .catch(() => {
        error(_t("g.server-error"));
      });
  };

  filterChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    this.stateSet({ filter: value });
  };

  render() {
    const { list, filter, loading, innerRef } = this.state;

    return (
      <div className="dialog-content">
        {(() => {
          if (loading) {
            return <LinearProgress />;
          }

          if (list.length === 0) {
            return <div className="schedules-list">{_t("g.empty-list")}</div>;
          }

          const items = list.filter(
            (x) => x.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1
          );

          return (
            <>
              <div className="dialog-filter">
                <FormControl
                  ref={innerRef}
                  type="text"
                  placeholder={_t("drafts.filter")}
                  value={filter}
                  onChange={this.filterChanged}
                />
              </div>

              {items.length === 0 && <span className="text-gray-600">{_t("g.no-matches")}</span>}

              {items.length > 0 && (
                <div className="schedules-list">
                  <div className="schedules-list-body flex flex-col gap-3 my-4">
                    {items.map((item) => (
                      <ScheduledListItem
                        key={item._id}
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

class SchedulesDialog extends Component<Props> {
  hide = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    return (
      <Modal show={true} centered={true} onHide={this.hide} size="lg" className="schedules-modal">
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("schedules.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Schedules {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}

export default ({ history, onHide }: Pick<Props, "history" | "onHide">) => {
  const { global, activeUser } = useMappedStore();
  const location = useLocation();

  return (
    <SchedulesDialog
      global={global}
      history={history}
      location={location}
      activeUser={activeUser!!}
      onHide={onHide}
    />
  );
};
