import React from 'react';
import { useEffect } from 'react';
import { Col, Container, Row, Button } from "react-bootstrap";
import { _t } from '../../i18n';

export interface Props {
    title: string;
    description: React.ReactNode;
    media: string;
    onClose: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    placement?: string
}

export const Introduction = ({ title, description, media, onClose, onPrevious, onNext, placement }: Props) => {
    useEffect(() => {
        let body = document.getElementsByTagName('body')[0];
        body.classList.add("overflow-hidden");
        return () => {
            body.classList.remove("overflow-hidden");
        }
    },[]);

    return <>
    <div className="intro-popup p-3 p-lg-0" style={{left: placement}}>
    <Container className="h-100">
        <button type="button" className="close position-absolute close-btn" onClick={onClose}>
            <span aria-hidden="true">&times;</span>
        </button>
        <Row className="justify-content-center h-100 align-items-center mt-4 mt-md-0">
            <Col xs={12} md={3}>
                <img width="100%" src={media} className='media-intro'/>
            </Col>
            <Col xs={12} md={5}>
                <h1 className="mb-2 mb-md-4 text-dark font-weight-bold title">{title}</h1>
                <p className="text-muted paragraph mt-2 mt-md-0">{description}</p>
                <div className='d-flex flex-column flex-md-row'>
                    {onPrevious && <Button size="lg" variant="outline-primary" className="mr-0 mr-md-3 w-100 w-md-50 intro-btn mb-3 mb-md-0" onClick={()=>{onPrevious()}}>{_t('g.previous')}</Button>}
                    {onNext && <Button size="lg" variant="primary" className="w-50 w-100 w-md-50 intro-btn" onClick={()=>{onNext()}}>{_t('g.next')}</Button>}
                </div>
            </Col>
        </Row>
    </Container>
</div>

    </>
  
}