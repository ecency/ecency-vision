import React, {Component} from "react";

import {Form, FormControl, Modal, Button, Col, Row} from "react-bootstrap";

import {ActiveUser} from "../../store/active-user/types";


import LinearProgress from "../linear-progress";
import SuggestionList from "../suggestion-list";
import {error} from "../feedback";

import {searchPath, getPoints, getPromotePrice, PromotePrice, getPromotedPost} from "../../api/private";

import {getPost} from "../../api/bridge";

import {promote, formatError} from "../../api/operations";
import {_t} from "../../i18n";

import _c from "../../util/fix-class-names";

interface Props {
    activeUser: ActiveUser;
    onHide: () => void;
}

interface State {
    loading: boolean;
    balance: string;
    balanceError: string;
    path: string;
    postError: string;
    paths: string[];
    prices: PromotePrice[];
    duration: number;
    inProgress: boolean;
    success: boolean;
}


export class Promote extends Component<Props, State> {
    state: State = {
        loading: true,
        balance: "0.000",
        balanceError: "",
        path: "",
        paths: [],
        postError: "",
        prices: [],
        duration: 1,
        inProgress: false,
        success: false
    }

    _timer: any = null;
    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    componentDidMount() {
        this.init();
    }

    init = () => {
        const {activeUser} = this.props;

        getPromotePrice(activeUser.username).then(r => {
            const prices = r.sort((a, b) => a.duration - b.duration);
            this.stateSet({prices, duration: prices[1].duration});

            return getPoints(activeUser.username);
        }).then(r => {
            this.stateSet({balance: r.points, loading: false}, () => {
                this.checkBalance();
            });
        }).catch(() => {
            error(_t('g.server-error'));
        });
    }

    durationChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const duration = Number(e.target.value);
        this.stateSet({duration}, () => {
            this.checkBalance();
        });
    }

    pathChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        const path = e.target.value;
        this.stateSet({path, postError: ''});

        clearTimeout(this._timer);

        if (path.trim().length < 3) {
            this.stateSet({paths: []});
            return;
        }

        const {activeUser} = this.props;

        this._timer = setTimeout(
            () =>
                searchPath(activeUser.username, path).then(resp => {
                    this.stateSet({paths: resp});
                }),
            500
        );
    }

    pathSelected = (path: string) => {
        this.stateSet({path: path, paths: []});
    }


    checkBalance = () => {
        const {duration} = this.state;

        const {prices, balance} = this.state;
        const {price} = prices.find(x => x.duration === duration)!;

        const balanceError = parseFloat(balance) < price ? _t('promote.balance-error') : "";

        this.stateSet({balanceError});
    };

    isValidPath = (p: string) => {
        if (p.indexOf("/") === -1) {
            return;
        }

        const [author, permlink] = p.replace("@", "").split("/");
        return author.length >= 3 && permlink.length >= 3;
    };

    submit = async () => {
        const {activeUser} = this.props;
        const {path, duration} = this.state;

        const [author, permlink] = path.replace("@", "").split("/");

        this.stateSet({inProgress: true});

        // Check if post is valid
        const post = await getPost(author, permlink);
        if (!post) {
            this.stateSet({postError: _t("promote.post-error"), inProgress: false});
            return;
        }

        const promoted = await getPromotedPost(activeUser.username, author, permlink);
        if (promoted) {
            this.stateSet({postError: _t("promote.post-error-exists"), inProgress: false});
            return;
        }

        promote(activeUser.username, author, permlink, duration).then(r => {
            console.log(r)
            this.stateSet({success: true});
        }).catch(err => {
            error(formatError(err));
        }).finally(() => {
            this.setState({inProgress: false});
        });
    }

    render() {
        const {prices, balance, balanceError, path, paths, postError, duration, loading, inProgress} = this.state;

        if (loading) {
            return <div className="promote-dialog-content"><LinearProgress/></div>;
        }

        const canSubmit = !postError && !balanceError && this.isValidPath(path);

        return <div className="promote-dialog-content">
            <Form.Group as={Row}>
                <Form.Label column={true} sm="2">{_t('promote.balance')}</Form.Label>
                <Col sm="10">
                    <Form.Control className={_c(`balance-input ${balanceError ? "is-invalid" : ""}`)} plaintext={true} readOnly={true} defaultValue={`${balance} POINTS`}/>
                    <Form.Text className="text-danger">{balanceError || ""}</Form.Text>
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column={true} sm="2">{_t('promote.post')}</Form.Label>
                <Col sm="10">
                    <SuggestionList items={paths} renderer={i => i} onSelect={this.pathSelected}>
                        <Form.Control className={postError ? 'is-invalid' : ''} type="text" value={path} onChange={this.pathChanged} autoFocus={true}
                                      placeholder={_t('promote.post-placeholder')}/>
                    </SuggestionList>
                    <Form.Text className="text-danger">{postError || ""}</Form.Text>
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column={true} sm="2">{_t('promote.duration')}</Form.Label>
                <Col sm="10">
                    <Form.Control as="select" value={duration} onChange={this.durationChanged}>
                        {prices.map(p => {
                            const {duration: d, price: pr} = p;
                            const label = `${d} ${d === 1 ? 'day' : 'days'} - ${pr} POINTS`
                            return <option value={p.duration} key={p.duration}>{label}</option>
                        })}
                    </Form.Control>
                    <Form.Text/>
                </Col>
            </Form.Group>
            <Form.Group as={Row}>
                <Form.Label column={true} sm="2"/>
                <Col sm="10">
                    <Button type="button" onClick={this.submit} disabled={!canSubmit || inProgress} variant="primary">{_t('promote.submit')}</Button>
                </Col>
            </Form.Group>
        </div>
    }
}

export default class PromoteDialog extends Component<Props> {
    render() {
        const {onHide} = this.props;
        return (
            <Modal animation={false} show={true} centered={true} onHide={onHide} keyboard={false} className="promote-dialog" size="lg">
                <Modal.Header closeButton={true}><Modal.Title>{_t('promote.title')}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Promote {...this.props} />
                </Modal.Body>
            </Modal>
        );
    }
}
