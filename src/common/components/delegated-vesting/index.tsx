import React, { Component } from "react";

import { Modal, Table, Button, Spinner } from "react-bootstrap";

import { VestingDelegation, getVestingDelegations } from "../../api/hive";
import DataListModal from "../data-list-modal";

interface Props {
  username: string;
  onHide: () => void;
}

interface State {
  data: VestingDelegation[];
}

export default class DelegatedVesting extends Component<Props, State> {
  state: State = {
    data: [],
  };

  componentDidMount() {
    const { username } = this.props;

    getVestingDelegations(username).then((r) => {
      this.setState({ data: r });
    });
  }

  render() {
    return (
      <DataListModal
        title="Delegated Hive Power"
        onHide={this.props.onHide}
        pages={10}
        pageChanged={(page: number) => {
          return new Promise((resolve) => {
            resolve(this.state.data);
          });
        }}
        columns={[
          {
            title: "delegatee",
            key: "delegatee",
            render: (record) => {
              return <>{record.delegatee}</>;
            },
          },
          {
            title: "vesting_shares",
            key: "vesting_shares",
            render: (record) => {
              return <></>;
            },
          },
        ]}
      />
    );
  }
}
