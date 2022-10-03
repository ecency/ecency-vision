import { Form, InputGroup } from "react-bootstrap";
import { _t } from "../../i18n";
import React from "react";

interface Props {
  value: string;
  setValue: (value: string) => void;
  labelKey: string;
}

export const SwapAmountControl = ({ value, setValue, labelKey }: Props) => {
  return (
    <Form.Group className="px-3 pt-3 pb-5 mb-0 border">
      <Form.Label>{_t(labelKey)}</Form.Label>
      <InputGroup className="align-items-center">
        <Form.Control
          className="amount-control pl-0"
          value={value}
          placeholder="0.0"
          onChange={(e) => setValue(e.target.value)}
        />
        <InputGroup.Append>
          <select className="form-control form-control py-2 border-0 h-auto font-weight-bold">
            <option value="HIVE">HIVE</option>
          </select>
        </InputGroup.Append>
      </InputGroup>
    </Form.Group>
  );
};
