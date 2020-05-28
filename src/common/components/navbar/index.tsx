import React, {Component} from 'react';

import {Link} from 'react-router-dom';

import {FormControl} from 'react-bootstrap';

import ToolTip from '../../components/tooltip';

import {_t} from '../../i18n';

import {magnifySvg, viewHeadLineSvg, brightnessSvg, appleSvg, googleSvg, desktopSvg} from '../../../svg';

interface Props {
    toggleTheme: () => void
}

export default class NavBar extends Component <Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>, nextContext: any): boolean {
        return false;
    }

    changeTheme = () => {
        this.props.toggleTheme();
    };

    render() {
        return <div className="nav-bar">
            <div className="nav-bar-inner">
                <Link to="/" className="brand">
                    <span className="brand-text">ecency</span>
                </Link>

                <div className="main-menu">
                    <Link className="menu-item" to="/">Posts</Link>
                    <Link className="menu-item" to="/communities">Communities</Link>
                    <a className="menu-item downloads" href="#">
                        <span className="label">Downloads</span>
                        <span className="icons">
                        <span className="img-apple">{appleSvg}</span>
                        <span className="img-google">{googleSvg}</span>
                        <span className="img-desktop">{desktopSvg}</span>
                    </span>
                    </a>
                    <Link className="menu-item" to="/about">About</Link>
                </div>

                <div className="search-bar">
                    <span className="prepend">{magnifySvg}</span>
                    <FormControl placeholder={_t('navbar.search-placeholder')}/>
                </div>

                <div className="alt-controls">
                    <div className="switch-theme" onClick={this.changeTheme}>
                        <ToolTip content={_t('navbar.change-theme')} placement="left">
                            {brightnessSvg}
                        </ToolTip>
                    </div>
                    <div className="sm-menu-toggle">{viewHeadLineSvg}</div>
                </div>
            </div>
        </div>
    }
}
