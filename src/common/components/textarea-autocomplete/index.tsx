import React from 'react';
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import "@webscopeio/react-textarea-autocomplete/style.css";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import { _t } from "../../i18n";

import { lookupAccounts } from "../../api/hive";
import { searchPath } from '../../api/search-api';
import { isMobile } from '../../util/is-mobile';

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
		const {activeUser, ...other} = this.props;
		return (
			<ReactTextareaAutocomplete
				{...other}
				loadingComponent={Loading}
				rows={this.state.rows}
				value={this.state.value}
				placeholder={this.props.placeholder}
				onChange={this.handleChange}
				boundariesElement={".body-input"}
				minChar={2}
				trigger={{
					["@"]: {
						dataProvider: token => {
							clearTimeout(timer);
							return new Promise((resolve) => {
								timer = setTimeout(async () => {
									if(token.includes("/")){
										let ignoreList = ['wallet', 'feed', 'followers', 'following', 'points', 'communities', 'posts', 'blog', 'comments', 'replies', 'settings', 'engine']
										let searchIsInvalid = ignoreList.some(item => token.includes(`/${item}`))
										if(!searchIsInvalid){
											searchPath(activeUser, token).then(resp => {
											resolve(resp)
										})
									} else {
										resolve([])
									}
									}
									else {
										let suggestions = await lookupAccounts(token, 5)
										resolve(suggestions)
									}
								}, 300);
							});
						},
						component: (props: any) => {
							let textToShow: string = props.entity.includes("/") ? props.entity.split("/")[1] : props.entity;
							let charLimit = isMobile() ? 16 : 30
							
							if(textToShow.length > charLimit && props.entity.includes("/")){
								textToShow = textToShow.substring(0, charLimit - 5) + "..." + textToShow.substring(textToShow.length - 6, textToShow.length-1)
							}

							return (
								<>
									{props.entity.includes("/") ? null : UserAvatar({ global: this.props.global, username: props.entity, size: "small" })}
									<span style={{ marginLeft: "8px" }}>{textToShow}</span>
								</>
							)
						},
						output: (item: any, trigger) => `@${item}`
					}
				}}
			/>
		);
	}
}
