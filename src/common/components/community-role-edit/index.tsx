import React, { Component } from "react";
import { Col, Row } from "react-bootstrap";
import { Global } from "../../store/global/types";
import { Community, CommunityTeam } from "../../store/communities";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import LinearProgress from "../linear-progress";
import { error } from "../feedback";
import { getAccount } from "../../api/hive";
import { clone } from "../../store/util";
import { formatError, setUserRole } from "../../api/operations";
import { _t } from "../../i18n";
import { Tsx } from "../../i18n/helper";
import "./_index.scss";
import { queryClient, QueryIdentifiers } from "../../core";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";

interface Props {
  global: Global;
  community: Community;
  activeUser: ActiveUser;
  user: string;
  role: string;
  roles: string[];
  onHide: () => void;
}

interface State {
  user: string;
  role: string;
  userError: string;
  inProgress: boolean;
}

export class CommunityRoleEdit extends BaseComponent<Props, State> {
  state: State = {
    user: this.props.user,
    role: this.props.role || this.props.roles[0],
    userError: "",
    inProgress: false
  };

  _input = React.createRef<HTMLInputElement>();

  userChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: user } = e.target;
    this.stateSet({ user });
  };

  roleChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value: role } = e.target;
    this.stateSet({ role });
  };

  submit = async () => {
    const { user, role } = this.state;
    const { community, activeUser, onHide } = this.props;

    if (user.trim() === "") {
      this._input.current?.focus();
      return false;
    }

    this.stateSet({ inProgress: true, userError: "" });

    let userData: Account | null | undefined;

    try {
      userData = await getAccount(user);
    } catch (e) {
      userData = null;
    }

    if (!userData) {
      this.stateSet({ inProgress: false, userError: _t("community-role-edit.user-not-found") });
    }

    return setUserRole(activeUser.username, community.name, user, role)
      .then(() => {
        const team: CommunityTeam = clone(community.team);
        const nTeam =
          team.find((x) => x[0] === user) === undefined
            ? [...team, [user, role, ""]]
            : team.map((x) => (x[0] === user ? [x[0], role, x[2]] : x));
        queryClient.setQueryData([QueryIdentifiers.COMMUNITY, community.name], {
          ...clone(community),
          ...{ ...clone(community), team: nTeam }
        });
        onHide();
      })
      .catch((err) => error(...formatError(err)))
      .finally(() => this.stateSet({ inProgress: false }));
  };

  render() {
    const { roles } = this.props;
    const { user, role, userError, inProgress } = this.state;

    return (
      <div className="community-role-edit-dialog-content">
        {inProgress && <LinearProgress />}
        <div className={`user-role-form ${inProgress ? "in-progress" : ""}`}>
          <Row className="mb-4">
            <Col sm={2}>
              <label>{_t("community-role-edit.username")}</label>
            </Col>
            <Col sm="10">
              <InputGroup prepend="@">
                <FormControl
                  type="text"
                  autoFocus={user === ""}
                  placeholder={_t("community-role-edit.username").toLowerCase()}
                  value={user}
                  onChange={this.userChanged}
                  className={userError ? "is-invalid" : ""}
                  ref={this._input}
                />
              </InputGroup>
              {userError && <small className="text-danger">{userError}</small>}
            </Col>
          </Row>
          <Row className="mb-4">
            <Col sm={2}>
              <label>{_t("community-role-edit.role")}</label>
            </Col>
            <Col sm="10">
              <FormControl type="select" value={role} onChange={this.roleChanged}>
                {roles.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </FormControl>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button type="button" onClick={this.submit} disabled={inProgress}>
              {_t("g.save")}
            </Button>
          </div>
        </div>
        <Tsx k="community-role-edit.explanations">
          <div className="explanations" />
        </Tsx>
      </div>
    );
  }
}

export default class CommunityRoleEditDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="community-role-edit-dialog"
        size="lg"
      >
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("community-role-edit.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <CommunityRoleEdit {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
