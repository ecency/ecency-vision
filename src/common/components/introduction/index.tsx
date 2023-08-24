import React, { useEffect, useRef } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { _t } from "../../i18n";
import "./_index.scss";
import { closeSvg } from "../../img/svg";

export interface Props {
  title: string;
  description: React.ReactNode;
  media: string;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  placement?: string;
  showFinish?: boolean;
}

export const Introduction = ({
  title,
  description,
  media,
  onClose,
  onPrevious,
  onNext,
  placement,
  showFinish
}: Props) => {
  const prevButton = useRef(null);

  useEffect(() => {
    let body = document.getElementsByTagName("body")[0];
    body.classList.add("overflow-hidden");
    return () => {
      body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <>
      <div className="intro-popup p-4 p-lg-0" style={{ left: placement }}>
        <Container className="h-100">
          <button
            type="button"
            className="position-absolute close-btn"
            onClick={onClose}
            id="close-btn"
          >
            {closeSvg}
          </button>
          <Row className="justify-content-center h-100 align-items-center mt-4 mt-md-0">
            <Col xs={12} md={3} className="p-0 px-md-3">
              <img width="100%" src={media} className="media-intro" id="media" />
            </Col>
            <Col xs={12} md={5} className="p-0 px-md-3">
              <h1 className="mb-2 mb-md-4 text-dark font-weight-bold title" id="title">
                {title}
              </h1>
              <p className="text-muted paragraph mt-2 mt-md-0" id="description">
                {description}
              </p>
              <div className="d-flex flex-column flex-md-row">
                {onPrevious && (
                  <Button
                    ref={prevButton}
                    size="lg"
                    variant="outline-primary"
                    className="mr-0 mr-md-3 w-100 w-md-50 intro-btn mb-3 mb-md-0"
                    onClick={() => {
                      onPrevious();
                    }}
                  >
                    {_t("g.previous")}
                  </Button>
                )}
                {onNext && (
                  <Button
                    size="lg"
                    variant="primary"
                    className="w-50 w-100 w-md-50 intro-btn"
                    onClick={() => {
                      onNext();
                    }}
                  >
                    {_t(showFinish ? "g.finish" : "g.next")}
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};
