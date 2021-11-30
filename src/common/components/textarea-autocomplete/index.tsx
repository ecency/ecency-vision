import React from 'react';
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import "@webscopeio/react-textarea-autocomplete/style.css";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar";
import {_t} from "../../i18n";

import { lookupAccounts } from "../../api/hive";

interface State {}

const Loading = () => <div>{_t("g.loading")}</div>;

let timer: any = null;

export default class TextareaAutocomplete extends BaseComponent<any, State> {
	constructor(props: any) {
		super(props);
	}

	render() {
		return (
			<ReactTextareaAutocomplete
				{...this.props}
				loadingComponent={Loading}
				trigger={{
					"@": {
						dataProvider: token => {
							clearTimeout(timer);
							return new Promise((resolve) => {
								timer = setTimeout(async () => {
									let suggestions = await lookupAccounts(token, 5)
									resolve(suggestions)
								}, 300);
							});
						},
						component: (props: any) => {
							return (
								<>
									{UserAvatar({ global: this.props.global, username: props.entity, size: "small"})}
									<span style={{marginLeft: "8px"}}>{props.entity}</span>
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