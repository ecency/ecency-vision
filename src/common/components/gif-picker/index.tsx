import React from "react";

import {FormControl} from "react-bootstrap";

import BaseComponent from "../base";
import SearchBox from "../search-box";

import {_t} from "../../i18n";

import {insertOrReplace} from "../../util/input-util";

import _ from 'lodash'
import axios from "axios";
import { GIPHY_API, GIPHY_SEARCH_API } from "../../api/misc";

interface Props {
    fallback?: (e: string) => void;
}

interface State {
    data: any[] | null;
    filter: string | null,
    filteredData: any[] | null,
}

export default class GifPicker extends BaseComponent<Props> {
    state: State = {
        data: null,
        filter: '',
        filteredData: null,
    };
    _target: HTMLInputElement | null = null;

    componentDidMount() {
                    
        this.getGifsData(null, GIPHY_API);

        this.watchTarget(); // initial

        if (typeof window !== 'undefined') {
            window.addEventListener('focus', this.watchTarget, true);
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        if (typeof window !== 'undefined') {
            window.removeEventListener('focus', this.watchTarget, true);
        }
    }

    watchTarget = () => {
        if (document.activeElement?.classList.contains("accepts-emoji")) {
            this._target = document.activeElement as HTMLInputElement;
        }
    };

    getSearchedData = async (_filter: string | null, _api: string) => {
        await axios(_api + _filter).then(res => {
            if(_filter?.length) {
                let _data:State = {
                    data: this.state.data,
                    filteredData: res.data.data,
                    filter: this.state.filter,
                }
                this.stateSet(_data);
            }
        })
    }

    
    getGifsData = async (_filter: string | null, _api: string) => {
        await axios(_api + _filter).then(res => {
            let _data:State = {
                data: res.data.data,
                filteredData: null,
                filter: null
            }
            this.stateSet(_data);
        })
    }


    itemClicked = (url: string) => {
        let _url = url.split(".gif");
        let gifUrl = _url[0] + ".gif";
      
        if(this._target) {
            insertOrReplace(this._target, gifUrl);
        }
    }

    delayedSearch = _.debounce(this.getSearchedData, 2000);

    filterChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        this.setState({filter: e.target.value});
        this.delayedSearch(e.target.value, GIPHY_SEARCH_API);
    };

    
    renderEmoji = (gifData: any[] | null) => {
        return gifData?.map(_gif => {
            return(
                <div className="emoji gifs" key={_gif.id}>
                    <img loading="lazy" src={_gif.images.fixed_height.url} alt="can't fetch :(" onClick={() => {
                        this.itemClicked(_gif.images.fixed_height.url);
                    }}/>
                </div>
            )
        });
    };

   

    render() {
        const {data,filteredData, filter} = this.state;
        if (!data && !filteredData) {
            return null;
        }

        // const recent: string[] = ls.get("recent-emoji", []);

        return (
            <div className="emoji-picker gif">
                <SearchBox autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" 
                    placeholder={_t("emoji-picker.filter-placeholder")}
                    onChange={this.filterChanged}
                />

                {(() => {
                    if (filter) {
                        
                        return (
                            <div className="emoji-cat-list gif-cat-list">
                                <div className="emoji-cat gif-cat">
                                    <div className="emoji-list gif-list">{this.renderEmoji(filteredData)}</div>
                                </div>
                                
                            </div>
                        )
                    }
                    else {
                        return (
                            <div className="emoji-cat-list gif-cat-list">
                                <div className="emoji-cat gif-cat">
                                    <div className="emoji-list gif-list">{this.renderEmoji(data)}</div>
                                </div>
                                
                            </div>
                        );
                    }
                    
                    
                })()}
            </div>
        );
    }
}
