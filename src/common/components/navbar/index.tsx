import React, {Component} from 'react';

import {Link} from 'react-router-dom';

import {InputGroup, FormControl, Button} from 'react-bootstrap';

import ToolTip from '../../components/tooltip';

import {_t} from '../../i18n';

import {magnifySvg, brightnessSvg} from '../../../svg';

interface Props {
    toggleTheme: () => any
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
            <Link to="/" className="brand">
                <span className="brand-text">ecency</span>
            </Link>
            <div className="search-bar">
                <InputGroup>
                    <FormControl
                        placeholder={_t('navbar.search-placeholder')}
                    />
                    <InputGroup.Append>
                        <Button variant="primary">{magnifySvg}</Button>
                    </InputGroup.Append>
                </InputGroup>
            </div>
            <div className="alt-controls">
            <span className="switch-theme"
                  onClick={this.changeTheme}>
                <ToolTip content={_t('navbar.change-theme')} placement="left">
                {brightnessSvg}
                </ToolTip>
            </span>
            </div>
        </div>
    }
}
