export function clipboard(str: string) {
  const i = document.createElement("input");
  i.setAttribute("type", "text");
  i.value = str;
  document.body.appendChild(i);
  i.select();
  document.execCommand("Copy");
  document.body.removeChild(i);
}

export function readClipboard(): Promise<string> {
  return navigator.clipboard
    ? navigator.clipboard
        .readText()
        .then((r) => r)
        .catch(() => "")
    : new Promise((resolve) => resolve(""));
}
