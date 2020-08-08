import React, {Component} from "react";

import {Modal} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {ToggleType} from "../../store/ui/types";

import LinearProgress from "../linear-progress";
import PopoverConfirm from "../popover-confirm";
import Tooltip from "../tooltip";

import {getImages, deleteImage, GalleryItem} from "../../api/private";

import {success} from "../feedback";

import {_t} from "../../i18n";

import {deleteForeverSvg} from "../../img/svg";

import clipboard from "../../util/clipboard";

interface Props {
    global: Global;
    users: User[];
    activeUser: ActiveUser | null;
    toggleUIProp: (what: ToggleType) => void;
}

interface State {
    loading: boolean,
    items: GalleryItem[]
}

export class Gallery extends Component<Props, State> {
    state: State = {
        loading: true,
        items: []
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = () => {
        const {users, activeUser} = this.props;
        const user = users.find((x) => x.username === activeUser?.username)!;

        this.setState({loading: true});
        getImages(user).then(items => {
            this.setState({items: this.sort(items), loading: false});
        });
    }

    sort = (items: GalleryItem[]) =>
        items.sort((a, b) => {
            return new Date(b.created).getTime() > new Date(a.created).getTime() ? 1 : -1;
        });

    itemClicked = (item: GalleryItem) => {

        clipboard(item.url);
        success(_t('gallery.copied'));
    }

    delete = (item: GalleryItem) => {
        const {users, activeUser} = this.props;
        const user = users.find((x) => x.username === activeUser?.username)!;

        deleteImage(user, item._id).then(() => {
            const {items} = this.state;
            const nItems = [...items].filter(x => x._id !== item._id);
            this.setState({items: this.sort(nItems)});
        });
    }

    render() {
        const {items, loading} = this.state;

        return <div className="dialog-content">
            {loading && <LinearProgress/>}
            {items.length > 0 && (
                <div className="gallery-list">
                    <div className="gallery-list-body">
                        {items.map(item => (
                            <div
                                className="gallery-list-item"
                                style={{backgroundImage: `url('${item.url}')`}}
                                key={item._id}>
                                <div className="item-inner"
                                     onClick={() => {
                                         this.itemClicked(item);
                                     }}/>
                                <div className="item-controls">
                                    <PopoverConfirm
                                        titleText={_t("g.are-you-sure")}
                                        okText={_t("g.ok")}
                                        cancelText={_t("g.cancel")}
                                        onConfirm={() => {
                                            this.delete(item);
                                        }}>
                                           <span className="btn-delete">
                                               <Tooltip content={_t("g.delete")}>
                                                   {deleteForeverSvg}
                                               </Tooltip>
                                           </span>
                                    </PopoverConfirm>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    }
}


export default class GalleryDialog extends Component<Props> {

    hide = () => {
        const {toggleUIProp} = this.props;
        toggleUIProp('gallery');
    }

    render() {
        return (
            <Modal show={true} centered={true} onHide={this.hide} size="lg" className="gallery-modal">
                <Modal.Header closeButton={true}>
                    <Modal.Title>{_t('gallery.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Gallery {...this.props}/>
                </Modal.Body>
            </Modal>
        );
    }
}
