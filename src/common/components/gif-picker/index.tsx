import React from "react";

import {FormControl} from "react-bootstrap";

import BaseComponent from "../base";
import SearchBox from "../search-box";

import {_t} from "../../i18n";

import {insertOrReplace} from "../../util/input-util";


import axios from "axios";
import { GIPHY_API, GIPHY_SEARCH_API } from "../../api/misc";

interface Props {
    fallback?: (e: string) => void;
    onPick?: (url: string) => void;
}

interface State {
    data: any[] | null;
    filter: string | null,
    filteredData: any[] | null,
}

export default class GifPicker extends BaseComponent<Props> {
    state: State = {
        data: null,
        filter: null,
        filteredData: null,
    };
    _target: HTMLInputElement | null = null;

    componentDidMount() {
                    
        this.getGifsData(null, GIPHY_API, false);

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

    
    getGifsData = async (_filter: string | null, _api: string, isFiltered: boolean) => {
        await axios(_api + _filter).then(res => {
            // console.log('res', res)
            if(isFiltered) {
                const _data: State = {
                    data: this.state.data,
                    filteredData: res.data.data,
                    filter: this.state.filter,
                }
                this.stateSet(_data)
            } else {
                const _data: State = {
                    data: res.data.data,
                    filteredData: null,
                    filter: null
                }
                this.stateSet(_data)
            }
           
        })
    }

    

    itemClicked = (url: string) => {
        if(this._target) {
            // console.log(this._target);
            insertOrReplace(this._target, url);
        }
    }


    filterChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        this.setState({filter: e.target.value});
        // console.log(this.state.filter);
    };

    renderEmoji = (gifData: any[]) => {
        return gifData.map(_gif => {
            return(
                <div className="emoji" key={_gif.id}>
                    <img src={_gif.images.fixed_height.url} alt="can't fetch :(" onClick={() => {
                        // console.log(_gif.images.fixed_height.url);
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
                <SearchBox autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" placeholder={_t("emoji-picker.filter-placeholder")}
                           onChange={this.filterChanged}/>

                {(() => {
                    if (filter) {
                        
                        this.getGifsData(filter, GIPHY_SEARCH_API, true);
                        return (
                            <div className="emoji-cat-list">
                                <div className="emoji-cat">
                                    <div className="emoji-list">{filteredData?.map(() => this.renderEmoji(filteredData))}</div>
                                </div>
                                
                            </div>
                        )
                        
                    }
                    else {
                        return (
                            <div className="emoji-cat-list">
                                
                                <div className="emoji-cat">
                                    <div className="emoji-list">{data?.map(() => this.renderEmoji(data))}</div>
                                </div>
                                
                            </div>
                        );
                    }
                    
                    
                })()}
            </div>
        );
    }
}
