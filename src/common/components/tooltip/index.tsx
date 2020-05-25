import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import {Placement} from 'react-bootstrap/Overlay';

const uniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

interface TooltipProps {
    placement: Placement,
    content: string,
    children: JSX.Element
}

export default ({placement = 'bottom', content, children}: TooltipProps) => {
    return <OverlayTrigger
        placement={placement}
        overlay={
            <Tooltip id={uniqueId()}>{content}</Tooltip>
        }>
        {children}
    </OverlayTrigger>
};

