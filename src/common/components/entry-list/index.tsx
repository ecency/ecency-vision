import React, {Component} from "react";
import {History, Location} from "history";
import _ from 'lodash'

import {Global, ProfileFilter} from "../../store/global/types";
import {Account} from "../../store/accounts/types";
import {DynamicProps} from "../../store/dynamic-props/types";
import {Entry} from "../../store/entries/types";
import {Community, Communities} from "../../store/communities/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Reblogs} from "../../store/reblogs/types";
import {UI, ToggleType, Entry} from "../../store/ui/types";

import EntryListItem from "../entry-list-item/index";
import {EntryPinTracker} from "../../store/entry-pin-tracker/types";
import MessageNoData from "../message-no-data";
import SearchBox from '../search-box'
import { Link } from "react-router-dom";
import { _t } from "../../i18n";
import * as ls from "../../util/local-storage";
import LinearProgress from "../linear-progress";
import { getFollowing } from "../../api/hive";
import { search as searchApi } from "../../api/search-api"
import SearchQuery, {SearchType} from "../../helper/search-query";

import { Row, Form, Col, FormControl, Button } from 'react-bootstrap'

interface Props {
    history: History;
    location: Location;
    global: Global;
    dynamicProps: DynamicProps;
    entries: Entry[];
    promotedEntries: Entry[];
    communities: Communities;
    community?: Community | null;
    users: User[];
    activeUser: ActiveUser | null;
    reblogs: Reblogs;
    loading: boolean;
    ui: UI;
    entryPinTracker: EntryPinTracker;
    signingKey: string;
    addAccount: (data: Account) => void;
    updateEntry: (entry: Entry) => void;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    fetchReblogs: () => void;
    addReblog: (author: string, permlink: string) => void;
    deleteReblog: (author: string, permlink: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    addCommunity: (data: Community) => void;
    trackEntryPin: (entry: Entry) => void;
    setSigningKey: (key: string) => void;
    setEntryPin: (entry: Entry, pin: boolean) => void;
}

interface State {
    mutedUsers: string[];
    loadingMutedUsers: boolean,
    entriesData: Entry[],
    search: string;
    author: string;
    type: SearchType;
}

export class EntryListContent extends Component<Props, State> {
    state = {
        mutedUsers: [] as string[],
        loadingMutedUsers: false,
        entriesData: [],
        search: "",
        author: "",
        type: SearchType.ALL,
    }

    constructor(props: any) {
        super(props);
        this.handleInputChange = _.debounce(this.handleInputChange.bind(this), 200);
        this.handleChangeSearch = this.handleChangeSearch.bind(this)
    }

    fetchMutedUsers = () => {
        const { activeUser } = this.props;
        const { loadingMutedUsers } = this.state;
        if(!loadingMutedUsers){
            if(activeUser){
            this.setState({ loadingMutedUsers: true });
            getFollowing(activeUser.username, "", "ignore", 100).then(r => {
                if (r) {
                    let filterList = r.map(user => user.following);
                    this.setState({mutedUsers: filterList })
                }
            }).finally(()=>{
                this.setState({ loadingMutedUsers: false })
            })
        }
        }
    }

    componentDidUpdate(prevProps:Props){
        if(prevProps.activeUser?.username !== this.props.activeUser?.username){
            this.fetchMutedUsers()
        }
        if(prevProps.activeUser !== this.props.activeUser && !this.props.activeUser){
            this.setState({mutedUsers:[]})
        }
        if(prevProps.entries !== this.props.entries) {
            this.setState({ entriesData: this.props.entries });
        }
    }

    componentDidMount(){
        this.fetchMutedUsers();
        this.setState({ entriesData: this.props.entries });
    }


    handleSubmitSearch = async () => {
      const { search, author, type } = this.state;
      const { global, activeUser } = this.props;
      console.log('values: ', search, activeUser, type);

      let query = `${search} author:${author}`;
      if(global.filter === 'posts') {
        query += ` type:post`
      } else if(global.filter === 'comments') {
        query += ` type:comment`
      } 
      console.log('query: ', query)
      const data = await  searchApi(query, "popularity", "1");
      console.log('data: ', data.results)
      if(data && data.results) {
        // this.setState({entriesData: data.results})
      }
    }

    handleChangeSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        this.setState({ search: value});
        this.handleInputChange(value)

      //   const { global } = this.props;

      //   console.log('props: ', this.props);


      // let type = global.filter === 'posts' ? 'post' : global.filter === 'comments' ? 'comment' : null;
      //   let query = ``;
      //   if(global.filter === 'blog') {
      //     query += `author:${value}`
      //   }
      //   if(type) {
      //     query += ` type:${type}`
      //   }
      //   console.log('query: ', query);

      //   searchApi(`{author: ${value}}`, "popularity", "1", "2020-10-20T20:43:33");
    }

    handleInputChange =( value: any) => {
        if(value.trim() === ''){
            this.setState({entriesData: this.props.entries});
        } else {
            let results: Entry[] = [];
            this.props.entries.forEach((item: Entry) => {
                if(
                    item.title.toLowerCase().search(value.toLowerCase().trim()) > -1 || 
                    item.body.toLowerCase().search(value.toLowerCase().trim()) > -1 || 
                    item.category.toLowerCase().search(value.toLowerCase().trim()) > -1 || 
                    (item.community && item.community.toLowerCase().search(value.toLowerCase().trim()) > -1 )|| 
                    (item.community_title && item.community_title.toLowerCase().search(value.toLowerCase().trim()) > -1 )|| 
                    item.author.toLowerCase().search(value.toLowerCase().trim()) > -1) {
                    results.push(item);
                }
            });
            this.setState({entriesData: results})
        }
    }

    searchChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
      this.setState({search: e.target.value});
    }

    authorChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
        this.setState({author: e.target.value.trim()});
    }

    typeChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
        this.setState({type: e.target.value as SearchType});
    }


    textInputDown = (e: React.KeyboardEvent) => {
      if (e.keyCode === 13) {
          this.handleSubmitSearch();
      }
    };

    render() {
        const {entries, promotedEntries, global, activeUser, loading } = this.props;
        const {filter} = global;
        const { mutedUsers, loadingMutedUsers, entriesData, search, author, type } = this.state;
        // let dataToRender = entries;
        let dataToRender = entriesData;

        let mutedList: string[] = [];
        if(mutedUsers && mutedUsers.length > 0 && activeUser && activeUser.username){
            mutedList = mutedList.concat(mutedUsers)
        }
        
        console.log('entries: ', entries);
        console.log('props: ', this.props);
        
        return (
            <>
                <div className='searchProfile'>
                    {/* <SearchBox 
                      placeholder={_t('search.placeholder')}  
                      onChange={this.handleChangeSearch} 
                      value={this.state.search} 
                    />
                    <Button 
                      className="btnSearch" 
                      type="button" 
                      onClick={this.handleSubmitSearch}
                    >{_t("g.search")}</Button> */}

                    <div className="advanced-section">
                        <Row>
                            <Form.Group as={Col} sm="6" controlId="form-search">
                                <Form.Label>{_t("search-comment.search")}</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={_t("search-comment.search-placeholder")}
                                    value={search}
                                    onChange={this.searchChanged}
                                    onKeyDown={this.textInputDown}/>
                            </Form.Group>
                            <Form.Group as={Col} sm="4" controlId="form-author">
                                <Form.Label>{_t("search-comment.author")}</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={_t("search-comment.author-placeholder")}
                                    value={author}
                                    onChange={this.authorChanged}
                                    onKeyDown={this.textInputDown}/>
                            </Form.Group>
                            
                            <Form.Group as={Col} sm="2" controlId="form-type">
                                <Button className="btnSearch" type="button" onClick={this.handleSubmitSearch}>{_t("g.search")}</Button>
                            </Form.Group>
                            
                        </Row>
                    </div>
                </div>
                
                {
                    loadingMutedUsers ? <LinearProgress /> : dataToRender.length > 0 ? (
                        <>
                            {dataToRender.map((e, i) => {
                                const l = [];
                                
                                if (i % 4 === 0 && i > 0) {
                                    const ix = i / 4 - 1;
                                    
                                    if (promotedEntries[ix]) {
                                        const p = promotedEntries[ix];
                                        let isPostMuted = (activeUser && activeUser.username && mutedList.includes(p.author)) || false;
                                        if (!dataToRender.find(x => x.author === p.author && x.permlink === p.permlink)) {
                                            l.push(
                                                <EntryListItem
                                                key={`${p.author}-${p.permlink}`}
                                                {...Object.assign({}, this.props, {entry: p})}
                                                promoted={true} order={4}
                                                muted={isPostMuted}
                                                />
                                                );
                                            }
                                        }
                                    }
                                    
                                    let isPostMuted = (activeUser && activeUser.username && mutedList.includes(e.author)) || false;
                                    l.push(<EntryListItem key={`${e.author}-${e.permlink}`} {...this.props} entry={e} order={i}
                                muted={isPostMuted}/>);
                                return [...l];
                            })}
                        </>
                    ) : !loading &&  <MessageNoData>
                            {(global.tag===`@${activeUser?.username}` && global.filter === "posts") ? 
                            <div className='text-center'>
                                <div className="info">{_t("profile-info.no-posts")}</div>
                                <Link to='/submit' className="action"><b>{_t("profile-info.create-posts")}</b></Link>
                            </div>:
                            <div className="info">{`${_t("g.no")} ${_t(`g.${filter}`)} ${_t("g.found")}.`}</div>}
                        </MessageNoData>
                }
            
            </>
        );
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        location: p.location,
        global: p.global,
        dynamicProps: p.dynamicProps,
        entries: p.entries,
        promotedEntries: p.promotedEntries,
        communities: p.communities,
        community: p.community,
        users: p.users,
        activeUser: p.activeUser,
        reblogs: p.reblogs,
        ui: p.ui,
        entryPinTracker: p.entryPinTracker,
        signingKey: p.signingKey,
        addAccount: p.addAccount,
        updateEntry: p.updateEntry,
        setActiveUser: p.setActiveUser,
        updateActiveUser: p.updateActiveUser,
        deleteUser: p.deleteUser,
        fetchReblogs: p.fetchReblogs,
        addReblog: p.addReblog,
        deleteReblog: p.deleteReblog,
        toggleUIProp: p.toggleUIProp,
        addCommunity: p.addCommunity,
        trackEntryPin: p.trackEntryPin,
        setSigningKey: p.setSigningKey,
        setEntryPin: p.setEntryPin,
        loading: p.loading
    }

    return <EntryListContent {...props} />;
}
