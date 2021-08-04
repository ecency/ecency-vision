import React from 'react';

interface State {
    value: string;
    rows: number;
    minRows: number;
    maxRows: number;
}

export default class ResizableTextarea extends React.Component<any, State> {
	constructor(props:any) {
		super(props);
		this.state = {
			value: this.props.value,
			rows: this.props.minRows || 5,
			minRows: this.props.minRows || 5,
			maxRows: this.props.maxRows || 20,
		};
	}
	
	handleChange = (event: any) => {
		const textareaLineHeight = 24;
		const { minRows, maxRows } = this.state;
		
		const previousRows = event.target.rows;
  	    event.target.rows = minRows; // reset number of rows in textarea 
		
		const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);
    
        if (currentRows === previousRows) {
            event.target.rows = currentRows;
        }
		
		if (currentRows >= maxRows) {
			event.target.rows = maxRows;
			event.target.scrollTop = event.target.scrollHeight;
		}
    
        this.setState({
            value: event.target.value,
            rows: currentRows < maxRows ? currentRows : maxRows,
        });
        this.props.onChange(event)
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