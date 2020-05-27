import React, {Component} from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {Placement} from 'react-bootstrap/Overlay';

const uniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

interface TooltipProps {
    placement: Placement,
    content: string,
    children: JSX.Element,
    delay: number
}

export default class MyTooltip extends Component <TooltipProps> {
    public static defaultProps: Partial<TooltipProps> = {
        placement: 'bottom',
        delay: 1000
    };

    render() {
        const {placement, content, children, delay} = this.props;
        return <OverlayTrigger
            delay={delay}
            placement={placement}
            overlay={
                <Tooltip id={uniqueId()}>{content}</Tooltip>
            }>
            {children}
        </OverlayTrigger>
    }
}
