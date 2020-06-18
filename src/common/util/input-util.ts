export const inputReplacer = (txtEl: HTMLInputElement, before: string, after: string = "") => {
  const startPos = txtEl.selectionStart;
  const endPos = txtEl.selectionEnd;

  if (startPos === null || endPos === null) {
    return;
  }

  const selText = txtEl.value.substring(startPos, endPos);

  let insertText = `${before}${selText}${after}`;

  const newStartPos = startPos + before.length;
  const newEndPos = newStartPos + selText.length;

  txtEl.focus();

  document.execCommand("insertText", false, insertText);

  txtEl.selectionStart = newStartPos;
  txtEl.selectionEnd = newEndPos;
};
