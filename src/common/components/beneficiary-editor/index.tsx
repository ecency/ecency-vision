import React, { useMemo, useRef, useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { error } from "../feedback";
import { BeneficiaryRoute } from "../../api/operations";
import { getAccount } from "../../api/hive";
import { _t } from "../../i18n";
import { accountMultipleSvg, deleteForeverSvg, plusSvg } from "../../img/svg";
import { handleInvalid, handleOnInput } from "../../util/input-util";
import "./_index.scss";
import { useThreeSpeakManager } from "../../pages/submit/hooks";

interface Props {
  body: string;
  author?: string;
  list: BeneficiaryRoute[];
  onAdd: (item: BeneficiaryRoute) => void;
  onDelete: (username: string) => void;
}

export function BeneficiaryEditorDialog({ list, author, onDelete, body, onAdd }: Props) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const { videos } = useThreeSpeakManager();

  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [percentage, setPercentage] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const used = useMemo(() => list.reduce((a, b) => a + b.weight / 100, 0), [list]);

  return (
    <>
      <Button size="sm" onClick={() => setVisible(!visible)}>
        {list.length > 0
          ? _t("beneficiary-editor.btn-label-n", { n: list.length })
          : _t("beneficiary-editor.btn-label")}
        <span style={{ marginLeft: "6px" }}>{accountMultipleSvg}</span>
      </Button>

      {visible && (
        <Modal
          onHide={() => setVisible(!visible)}
          show={true}
          centered={true}
          animation={false}
          className="beneficiary-editor-dialog"
        >
          <Modal.Header closeButton={true}>
            <Modal.Title>{_t("beneficiary-editor.title")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form
              ref={formRef}
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (!formRef.current?.checkValidity()) {
                  return;
                }

                if (list.find((x) => x.account === username) !== undefined) {
                  error(_t("beneficiary-editor.user-exists-error", { n: username }));
                  return;
                }

                setInProgress(true);
                getAccount(username)
                  .then((r) => {
                    if (!r) {
                      error(_t("beneficiary-editor.user-error", { n: username }));
                      return;
                    }

                    onAdd({
                      account: username,
                      weight: Number(percentage) * 100
                    });

                    setUsername("");
                    setPercentage("");
                  })
                  .finally(() => setInProgress(false));
              }}
            >
              <div className="beneficiary-list">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>{_t("beneficiary-editor.username")}</th>
                      <th>{_t("beneficiary-editor.reward")}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {author && 100 - used > 0 && (
                      <tr>
                        <td>{`@${author}`}</td>
                        <td>{`${100 - used}%`}</td>
                        <td />
                      </tr>
                    )}
                    <tr>
                      <td>
                        <InputGroup size="sm">
                          <InputGroup.Prepend>
                            <InputGroup.Text>@</InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            disabled={inProgress}
                            autoFocus={true}
                            required={true}
                            minLength={3}
                            maxLength={20}
                            value={username}
                            onInvalid={(e: any) =>
                              handleInvalid(e, "beneficiary-editor.", "validation-username")
                            }
                            onInput={handleOnInput}
                            onChange={(e) => setUsername(e.target.value.trim().toLowerCase())}
                          />
                        </InputGroup>
                      </td>
                      <td>
                        <InputGroup size="sm">
                          <Form.Control
                            disabled={inProgress}
                            required={true}
                            type="number"
                            size="sm"
                            min={1}
                            max={100 - used}
                            step={1}
                            value={percentage}
                            onChange={(e) => setPercentage(e.target.value)}
                            onInvalid={(e: any) =>
                              handleInvalid(e, "beneficiary-editor.", "validation-percentage")
                            }
                            onInput={handleOnInput}
                          />
                          <InputGroup.Append>
                            <InputGroup.Text>%</InputGroup.Text>
                          </InputGroup.Append>
                        </InputGroup>
                      </td>
                      <td>
                        <Button disabled={inProgress || 100 - used < 1} size="sm" type="submit">
                          {plusSvg}
                        </Button>
                      </td>
                    </tr>
                    {list.map((x) => {
                      return (
                        <tr key={x.account}>
                          <td>{`@${x.account}`}</td>
                          <td>{`${x.weight / 100}%`}</td>
                          <td>
                            {Object.values(videos).length > 0 && x.src === "ENCODER_PAY" ? (
                              <></>
                            ) : (
                              <Button
                                onClick={() => {
                                  onDelete(x.account);
                                }}
                                variant="danger"
                                size="sm"
                              >
                                {deleteForeverSvg}
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => setVisible(!visible)}>
              {_t("g.done")}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}
