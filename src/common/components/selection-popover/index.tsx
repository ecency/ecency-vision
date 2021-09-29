import ReactDOM from 'react-dom'
import React, { useState } from 'react'
import { Manager, Popper } from 'react-popper'

import SelectionReference from './selection-reference'
import { Button } from 'react-bootstrap'
import { copyContent } from '../../img/svg'
import { success } from '../feedback'
import { _t } from '../../i18n'

let tooltipStyle = {
  background: 'rgb(0 0 0 / 78%)',
  border: '1px solid green',
  maxWidth: "50%",
  borderRadius: 6,
}

export const SelectionPopover = ({children}: any) => {
  let [selectedText, setSelectedText] = useState('')


  const copyToClipboard = (text: string) => {
    const textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    success(_t('profile-edit.copied'));
}
  return (
    <div>

      <Manager>
        <SelectionReference
          onSelect={(selection:any) => setSelectedText(selection.toString())}
        >
          {(getProps: (arg0: { onMouseUp: () => void }) => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLParagraphElement> & React.HTMLAttributes<HTMLParagraphElement>) => (
            <p
              {...getProps({
                onMouseUp: () => console.log('We still can use this callback!'),
              })}
            >
              {children}
            </p>
          )}
        </SelectionReference>

        <Popper placement="top" >
          {({ ref, style, placement, arrowProps }) => (
            <div ref={ref} style={{ ...style, ...tooltipStyle }}>
                <Button onClick={() => copyToClipboard(selectedText)}>{copyContent}</Button>
            </div>
          )}
        </Popper>
      </Manager>
    </div>
  )
}
