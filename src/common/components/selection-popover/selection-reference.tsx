import React from 'react'
import { Reference } from 'react-popper'

// https://github.com/FezVrasta/react-popper#usage-without-a-reference-htmlelement
class VirtualSelectionReference {
  selection: any
  constructor(selection:any) {
    this.selection = selection
  }

  getBoundingClientRect() {
    return this.selection.getRangeAt(0).getBoundingClientRect()
  }

  get clientWidth() {
    return this.getBoundingClientRect().width
  }

  get clientHeight() {
    return this.getBoundingClientRect().height
  }
}

let SelectionReference = ({ onSelect, children } :any) => (
  <Reference>
    {({ ref } :any) =>
      children(({ onMouseUp, ...rest } :any = {}) => ({
        ...rest,
        onMouseUp: (...args :any) => {
          let selection = window.getSelection()

          if (!selection!.isCollapsed) {
            ref(new VirtualSelectionReference(selection))
            onSelect && onSelect(selection, ...args)
          }

          onMouseUp && onMouseUp(...args)
        },
      }))
    }
  </Reference>
)

export default SelectionReference
