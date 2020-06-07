import React, { Component } from "react";

import { Modal, Table, Button, Spinner } from "react-bootstrap";

interface Column {
  title: string;
  key: string;
  width?: number;
  render: (record: any) => JSX.Element;
}

interface Props {
  title?: string;
  pages: number;
  columns: Column[];
  pageChanged: (page: number) => Promise<any[]>;
  onFilter?: (value: string) => [];
  onHide: () => void;
}

interface State {
  data: any[];
}

export default class DataListModal extends Component<Props> {
  state: State = {
    data: [],
  };

  async componentDidMount() {
    const { pageChanged } = this.props;

    let data = [];
    try {
      data = await pageChanged(0);
    } catch (e) {}

    console.log(data)
    this.setState({ data });
  }

  render() {
    const { title, columns, onHide } = this.props;
    const { data } = this.state;
 

    return (
      <Modal onHide={onHide} show={true} centered={true}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table borderless={true} striped={true}>
            <thead>
              <tr>
                {columns.map((x) => (
                  <th key={x.key}>{x.title}</th>
                ))}
              </tr>
            </thead>
          </Table>
        </Modal.Body>
      </Modal>
    );
  }
}
