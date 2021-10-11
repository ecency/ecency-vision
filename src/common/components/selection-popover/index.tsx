import React, { useState } from 'react'
import { Manager, Popper } from 'react-popper'

import SelectionReference from './selection-reference'
import { copyContent, quotes, twitterSvg } from '../../img/svg'
import { success } from '../feedback'
import { _t } from '../../i18n'
import ClickAwayListener from '../clickaway-listener'

let tooltipStyle = {
  background: 'rgb(0 0 0 / 78%)',
  maxWidth: "50%",
  borderRadius: 6,
}

export const SelectionPopover = ({children, onQuotesClick, postUrl}: any) => {
  let [selectedText, setSelectedText] = useState('')


  const copyToClipboard = (text: string) => {
    const textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    success(_t('entry.content-copied'));
}
  return (
    <div>

      <Manager>
        <SelectionReference
          onSelect={(selection:any) => setSelectedText(selection.toString())}
        >
          {(getProps: (arg0: { onMouseUp: () => void }) => JSX.IntrinsicAttributes & React.ClassAttributes<HTMLParagraphElement> & React.HTMLAttributes<HTMLParagraphElement>) => (
            <div
              {...getProps({
                onMouseUp: () => {console.log('We still can use this callback!')},
              })}
            >
              {children}
            </div>
          )}
        </SelectionReference>

        <Popper placement="top" >
          {({ ref, style, placement, arrowProps }) => {
            ;
            return selectedText.length !== 0 && (
            <ClickAwayListener onClickAway={() => {setSelectedText(""); document.getSelection()?.removeAllRanges()}}>
                <div ref={ref} style={{ ...style, ...tooltipStyle }} className="p-2 d-flex icons-container align-items-center">
                    <div onClick={() => copyToClipboard(selectedText)} className="pointer">{copyContent}</div>
                    <a href={`https://twitter.com/intent/tweet?text=${selectedText} https://ecency.com${postUrl}`} target="_blank" className="mx-2 pointer twitter">{twitterSvg}</a>
                    <div onClick={() => {onQuotesClick(selectedText);setSelectedText("");document.getElementsByClassName("comment-box")[0].scrollIntoView({block:"center", })}} className="pointer quotes">{quotes}</div>
                </div>
            </ClickAwayListener>
          )}}
        </Popper>
      </Manager>
    </div>
  )
}
