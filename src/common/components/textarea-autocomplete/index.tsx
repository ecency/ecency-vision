import React from 'react';
import ReactTextareaAutocomplete from "@webscopeio/react-textarea-autocomplete";
import "@webscopeio/react-textarea-autocomplete/style.css";

import BaseComponent from "../base";

import {lookupAccounts} from "../../api/hive";

interface State {
	suggestions: string[];
	loading: boolean;
}

const Item = (props: any) => <div>{`${props.entity}`}</div>;

const Loading = () => <div>Loading</div>;

export default class TextareaAutocomplete extends BaseComponent<any, State> {
	constructor(props: any) {
		super(props);
		this.state = {
			suggestions: [],
			loading: false,
		};
	}

	fetchSuggestions = (token: string) => async (res: any) => {
		const { loading } = this.state;

		if (loading || !token) {
			return;
		}

		this.stateSet({ loading: true });
		let suggestions = await lookupAccounts(token, 20)
		suggestions = suggestions.map((x) => `@${x}`);
		this.stateSet({ loading: false });
		return res(suggestions)
	};

	render() {
		return (
			<ReactTextareaAutocomplete
				{...this.props}
				loadingComponent={Loading}
				trigger={{
					"@": {
						dataProvider: token => new Promise(this.fetchSuggestions(token)),
						component: Item,
						output: (item: any, trigger) => item
					},
				}}
			/>
		);
	}
}