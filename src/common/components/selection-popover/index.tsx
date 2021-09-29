import ReactDOM from 'react-dom'
import React, { useState } from 'react'
import { Manager, Popper } from 'react-popper'

import SelectionReference from './selection-reference'

let tooltipStyle = {
  background: '#fff',
  border: '1px solid green',
  padding: 10,
  margin: 10,
}

export const SelectionPopover = ({children}: any) => {
  let [selectedText, setSelectedText] = useState('')

  return (
    <div>
      <h1>Mediup like popup</h1>

      <h2>Select some text</h2>

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

        <Popper placement="bottom">
          {({ ref, style, placement, arrowProps }) => (
            <div ref={ref} style={{ ...style, ...tooltipStyle }}>
              easy 🙈
              <p>
                selected text: <b>{selectedText}</b>
              </p>
            </div>
          )}
        </Popper>
      </Manager>
    </div>
  )
}
