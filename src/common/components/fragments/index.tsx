import React, { Component } from "react";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import { error } from "../feedback";
import { _t } from "../../i18n";
import { postBodySummary } from "@ecency/render-helper";
import {
  addFragment,
  deleteFragment,
  Fragment,
  getFragments,
  updateFragment
} from "../../api/private-api";
import PopoverConfirm from "@ui/popover-confirm";
import { handleInvalid, handleOnInput } from "../../util/input-util";
import { useMappedStore } from "../../store/use-mapped-store";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Spinner } from "@ui/spinner";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

// ADD
interface AddProps {
  activeUser: ActiveUser;
  onAdd: () => void;
  onCancel: () => void;
}

interface AddState {
  title: string;
  body: string;
  inProgress: boolean;
}

export class AddFragment extends BaseComponent<AddProps, AddState> {
  state: AddState = {
    title: "",
    body: "",
    inProgress: false
  };

  form = React.createRef<HTMLFormElement>();

  titleChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.stateSet({ title: e.target.value });
  };

  bodyChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.stateSet({ body: e.target.value });
  };

  back = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  render() {
    const { title, body, inProgress } = this.state;

    return (
      <div className="">
        <Form
          ref={this.form}
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.form.current?.checkValidity()) {
              return;
            }

            const { activeUser, onAdd } = this.props;
            this.stateSet({ inProgress: true });
            addFragment(activeUser.username, title, body)
              .then(() => {
                onAdd();
              })
              .catch(() => {
                error(_t("g.server-error"));
              })
              .finally(() => {
                this.stateSet({ inProgress: false });
              });
          }}
        >
          <div className="mb-4">
            <label>{_t("fragments.form-title")}</label>
            <FormControl
              value={title}
              onChange={this.titleChanged}
              required={true}
              type="text"
              maxLength={255}
              autoFocus={true}
              onInvalid={(e: any) => handleInvalid(e, "fragments.", "validation-title")}
              onInput={handleOnInput}
            />
          </div>
          <div className="mb-4">
            <label>{_t("fragments.form-body")}</label>
            <FormControl
              onInvalid={(e: any) => handleInvalid(e, "fragments.", "validation-value")}
              onInput={handleOnInput}
              type="textarea"
              style={{ height: "300px" }}
              value={body}
              onChange={this.bodyChanged}
              required={true}
              maxLength={5000}
            />
          </div>
          <div className="flex justify-between">
            <Button outline={true} disabled={inProgress} onClick={this.back}>
              {_t("g.back")}
            </Button>
            <Button
              type="submit"
              disabled={inProgress}
              icon={inProgress && <Spinner className="mr-[6px] w-3.5 h-3.5" />}
              iconPlacement="left"
            >
              {}
              {_t("g.add")}
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}

// EDIT
interface EditProps {
  activeUser: ActiveUser;
  item: Fragment;
  onUpdate: () => void;
  onCancel: () => void;
}

interface EditState {
  title: string;
  body: string;
  inProgress: boolean;
}

export class EditFragment extends BaseComponent<EditProps, EditState> {
  state: EditState = {
    title: this.props.item.title,
    body: this.props.item.body,
    inProgress: false
  };

  form = React.createRef<HTMLFormElement>();

  titleChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.stateSet({ title: e.target.value });
  };

  bodyChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.stateSet({ body: e.target.value });
  };

  back = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  delete = () => {
    const { activeUser, item, onUpdate } = this.props;
    this.stateSet({ inProgress: true });
    deleteFragment(activeUser.username, item.id)
      .then(() => {
        onUpdate();
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  render() {
    const { title, body, inProgress } = this.state;

    return (
      <>
        <Form
          ref={this.form}
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.form.current?.checkValidity()) {
              return;
            }

            const { activeUser, item, onUpdate } = this.props;
            this.stateSet({ inProgress: true });
            updateFragment(activeUser.username, item.id, title, body)
              .then(() => {
                onUpdate();
              })
              .catch(() => {
                error(_t("g.server-error"));
              })
              .finally(() => {
                this.stateSet({ inProgress: false });
              });
          }}
        >
          <div className="mb-4">
            <label>{_t("fragments.form-title")}</label>
            <FormControl
              value={title}
              onChange={this.titleChanged}
              required={true}
              type="text"
              maxLength={255}
              autoFocus={true}
              onInvalid={(e: any) => handleInvalid(e, "fragments.", "validation-title")}
              onInput={handleOnInput}
            />
          </div>
          <div className="mb-4">
            <label>{_t("fragments.form-body")}</label>
            <FormControl
              type="textarea"
              style={{ height: "300px" }}
              value={body}
              onChange={this.bodyChanged}
              required={true}
              maxLength={5000}
              onInvalid={(e: any) => handleInvalid(e, "fragments.", "validation-body")}
              onInput={handleOnInput}
            />
          </div>
          <div className="flex justify-between">
            <div>
              <PopoverConfirm
                onConfirm={() => {
                  this.delete();
                }}
              >
                <Button
                  appearance="danger"
                  outline={true}
                  type="button"
                  disabled={inProgress}
                  style={{ marginRight: "6px" }}
                >
                  {_t("g.delete")}
                </Button>
              </PopoverConfirm>
              <Button outline={true} type="button" disabled={inProgress} onClick={this.back}>
                {_t("g.back")}
              </Button>
            </div>
            <Button
              type="submit"
              disabled={inProgress}
              icon={inProgress && <Spinner className="mr-[6px] w-3.5 h-3.5" />}
              iconPlacement="left"
            >
              {_t("g.update")}
            </Button>
          </div>
        </Form>
      </>
    );
  }
}

// LIST
interface Props {
  activeUser: ActiveUser;
  onHide: () => void;
  onPick?: (body: string) => void;
}

interface State {
  loading: boolean;
  list: Fragment[];
  filter: string;
  mode: "" | "add" | "edit";
  editingItem?: Fragment;
  innerRef: any;
}

export class Fragments extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    list: [],
    filter: "",
    innerRef: React.createRef(),
    mode: ""
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
    getFragments(activeUser?.username!)
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

  sort = (items: Fragment[]) =>
    items.sort((a, b) => {
      return new Date(b.created).getTime() > new Date(a.created).getTime() ? 1 : -1;
    });

  filterChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = e.target;
    this.stateSet({ filter: value });
  };

  render() {
    const { list, filter, loading, mode, editingItem, innerRef } = this.state;

    if (mode === "add") {
      return (
        <AddFragment
          {...this.props}
          onAdd={() => {
            this.stateSet({ mode: "" }, () => {
              this.fetch();
            });
          }}
          onCancel={() => {
            this.stateSet({ mode: "" });
          }}
        />
      );
    }

    if (mode === "edit" && editingItem) {
      return (
        <EditFragment
          {...this.props}
          item={editingItem}
          onUpdate={() => {
            this.stateSet({ mode: "" }, () => {
              this.fetch();
            });
          }}
          onCancel={() => {
            this.stateSet({ mode: "" });
          }}
        />
      );
    }

    return (
      <div className="dialog-content">
        {(() => {
          if (loading) {
            return <LinearProgress />;
          }

          if (list.length === 0) {
            return (
              <div className="fragments-list">
                <p>{_t("g.empty-list")}</p>
                <p>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      this.stateSet({ mode: "add" });
                    }}
                  >
                    {_t("fragments.create-first")}
                  </a>
                </p>
              </div>
            );
          }

          const items = list.filter(
            (x) => x.title.toLowerCase().indexOf(filter.toLowerCase()) !== -1
          );

          return (
            <>
              <div className="flex gap-3">
                <FormControl
                  ref={innerRef}
                  type="text"
                  placeholder={_t("fragments.filter")}
                  value={filter}
                  onChange={this.filterChanged}
                  style={{ marginRight: "6px" }}
                />
                <div>
                  <Button className="h-full" onClick={() => this.stateSet({ mode: "add" })}>
                    {_t("g.add")}
                  </Button>
                </div>
              </div>

              {items.length === 0 && <span className="text-gray-600">{_t("g.no-matches")}</span>}

              {items.length > 0 && (
                <div className="flex flex-col gap-3 my-4">
                  {items.map((item) => {
                    const summary = postBodySummary(item.body, 200);

                    return (
                      <div
                        className="flex flex-col border dark:border-dark-400 rounded-3xl overflow-hidden cursor-pointer hover:opacity-75 duration-300"
                        key={item.id}
                        onClick={() => {
                          const { onPick } = this.props;
                          if (onPick) {
                            onPick(item.body);
                            return;
                          }

                          this.setState({ editingItem: item, mode: "edit" });
                        }}
                      >
                        <div className="flex items-center gap-3 border-b dark:border-dark-300 px-3 py-2 bg-gray-100 dark:bg-dark-500">
                          {item.title}
                        </div>
                        <div className="text-gray-steel dark:text-white-075 px-3 py-2">
                          {summary}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          );
        })()}
      </div>
    );
  }
}

class FragmentsDialog extends Component<Props> {
  hide = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    return (
      <Modal show={true} centered={true} onHide={this.hide} size="lg" className="fragments-modal">
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("fragments.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <Fragments {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}

export default ({ onHide, onPick }: Pick<Props, "onHide" | "onPick">) => {
  const { activeUser } = useMappedStore();
  return <FragmentsDialog activeUser={activeUser!!} onHide={onHide} onPick={onPick} />;
};
