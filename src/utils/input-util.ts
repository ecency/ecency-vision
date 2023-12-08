import i18next from "i18next";

export const insertOrReplace = (txtEl: HTMLInputElement, before: string, after: string = "") => {
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

  if (typeof txtEl.setRangeText === "function") {
    // Firefox
    txtEl.setRangeText(insertText);
    txtEl.setSelectionRange(newStartPos, newEndPos);
  } else {
    // Webkit
    document.execCommand("insertText", false, insertText);
    txtEl.selectionStart = newStartPos;
    txtEl.selectionEnd = newEndPos;
  }

  txtEl.dispatchEvent(new Event("change", { bubbles: true }));
};

export const replace = (txtEl: HTMLInputElement, find: string, rep: string) => {
  const startPos = txtEl.value.indexOf(find);
  if (startPos === -1) {
    return;
  }
  const endPos = startPos + find.length;

  if (typeof txtEl.setRangeText === "function") {
    // Firefox
    txtEl.setSelectionRange(startPos, endPos);
    txtEl.setRangeText(rep);

    const newPos = txtEl.value.length;
    txtEl.setSelectionRange(newPos, newPos);
  } else {
    // Webkit
    txtEl.selectionStart = startPos;
    txtEl.selectionEnd = endPos;

    document.execCommand("insertText", false, rep);

    const newPos = txtEl.value.length;
    txtEl.selectionStart = newPos;
    txtEl.selectionEnd = newPos;
  }

  txtEl.dispatchEvent(new Event("change", { bubbles: true }));
};

export const handleInvalid = (e: any, parentKey: string, childKey: string) => {
  e.target.setCustomValidity(i18next.t(parentKey + childKey));
};

export const handleOnInput = (e: any) => e.target.setCustomValidity("");
