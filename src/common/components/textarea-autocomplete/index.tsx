import React from 'react';
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import "@webscopeio/react-textarea-autocomplete/style.css";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import { _t } from "../../i18n";

import { lookupAccounts } from "../../api/hive";
import { searchPath } from '../../api/search-api';

interface State {
	value: string;
	rows: number;
	minRows: number;
	maxRows: number;
}

const Loading = () => <div>{_t("g.loading")}</div>;

let timer: any = null;

export default class TextareaAutocomplete extends BaseComponent<any, State> {
	constructor(props: any) {
		super(props);
		this.state = {
			value: this.props.value,
			rows: this.props.minRows || 10,
			minRows: this.props.minrows || 10,
			maxRows: this.props.maxrows || 20,
		};
	}

	componentDidUpdate(prevProps: any){
		if(this.props.value !== prevProps.value){
			this.setState({value: this.props.value})
		}
	}

	handleChange = (event: any) => {
		const isMobile = typeof window !== 'undefined' && window.innerWidth < 570;
		if (isMobile) {
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
				rows: currentRows < maxRows ? currentRows : maxRows
			});
		}

		this.setState({
			value: event.target.value
		});
		this.props.onChange(event)
	};

	render() {

		return (
			<ReactTextareaAutocomplete
				{...this.props}
				loadingComponent={Loading}
				rows={this.state.rows}
				value={this.state.value}
				placeholder={this.props.placeholder}
				onChange={this.handleChange}
				trigger={{
					"@": {
						dataProvider: token => {
							clearTimeout(timer);
							if (token.indexOf('/')===-1) {
								return new Promise((resolve) => {
									timer = setTimeout(async () => {
										let suggestions = await lookupAccounts(token, 5)
										resolve(suggestions)
									}, 300);
								});
							} else {
								return new Promise((resolve) => {
									const splt = token.split('/');
									timer = setTimeout(async () => {
										let suggestions = await searchPath(splt[0], token);
										resolve(suggestions)
									}, 300);
								});
							}
						},
						component: (props: any) => {
							return (
								<>
									{props.entity.indexOf('/')===-1 && UserAvatar({ global: this.props.global, username: props.entity, size: "small" })}
									<span style={{ marginLeft: "8px" }}>{props.entity}</span>
								</>
							)
						},
						output: (item: any, trigger) => `@${item}`
					},
				}}
			/>
		);
	}
}
