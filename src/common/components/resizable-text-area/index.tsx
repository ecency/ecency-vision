import React from "react";

interface State {
  value: string;
  rows: number;
  minrows: number;
  maxrows: number;
}

export default class ResizableTextarea extends React.Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      value: this.props.value,
      rows: this.props.minrows || 5,
      minrows: this.props.minrows || 5,
      maxrows: this.props.maxrows || 20
    };
  }

  handleChange = (event: any) => {
    const textareaLineHeight = 24;
    const { minrows, maxrows } = this.state;

    const previousRows = event.target.rows;
    event.target.rows = minrows; // reset number of rows in textarea

    const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);

    if (currentRows === previousRows) {
      event.target.rows = currentRows;
    }

    if (currentRows >= maxrows) {
      event.target.rows = maxrows;
      event.target.scrollTop = event.target.scrollHeight;
    }

    this.setState({
      value: event.target.value,
      rows: currentRows < maxrows ? currentRows : maxrows
    });
    this.props.onChange(event);
  };

  render() {
    return (
      <textarea
        {...this.props}
        rows={this.state.rows}
        value={this.state.value}
        placeholder={this.props.placeholder}
        className={`${this.props.className}`}
        onChange={this.handleChange}
      />
    );
  }
}
