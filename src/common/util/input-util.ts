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

    document.execCommand("insertText", false, insertText);

    txtEl.selectionStart = newStartPos;
    txtEl.selectionEnd = newEndPos;
};

export const replace = (txtEl: HTMLInputElement, find: string, rep: string) => {
    const startPos = txtEl.value.indexOf(find);
    const endPos = startPos + find.length;

    txtEl.selectionStart = startPos;
    txtEl.selectionEnd = endPos;

    document.execCommand("insertText", false, rep);
}
