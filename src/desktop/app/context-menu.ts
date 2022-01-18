import { remote, shell, clipboard } from "electron";

import { _t } from "../../common/i18n";

const { Menu, MenuItem } = remote;

const isAnyTextSelected = () => window.getSelection() && window.getSelection()!.toString() !== "";

const itemCut = () =>
  new MenuItem({
    label: _t("context-menu.cut"),
    click: () => {
      document.execCommand("cut");
    }
  });

const itemCopy = () =>
  new MenuItem({
    label: _t("context-menu.copy"),
    click: () => {
      document.execCommand("copy");
    }
  });

const itemPaste = () =>
  new MenuItem({
    label: _t("context-menu.paste"),
    click: () => {
      document.execCommand("paste");
    }
  });

let imgUrlToOpen = "";
const itemImgOpen = () =>
  new MenuItem({
    label: _t("context-menu.open-image-browser"),
    click: () => {
      shell.openExternal(imgUrlToOpen);
    }
  });

const itemImgCopyUrl = () =>
  new MenuItem({
    label: _t("context-menu.copy-image-url"),
    click: () => {
      clipboard.writeText(imgUrlToOpen);
    }
  });

const normalMenu = new Menu();
normalMenu.append(itemCopy());

const textEditMenu = () => {
  const menu = new Menu();
  menu.append(itemCut());
  menu.append(itemCopy());
  menu.append(itemPaste());

  return menu;
};

const imgMenu = () => {
  const menu = new Menu();
  menu.append(itemImgOpen());
  menu.append(itemImgCopyUrl());

  return menu;
};

document.addEventListener(
  "contextmenu",
  (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    switch (target.nodeName) {
      case "IMG":
        imgUrlToOpen = target.getAttribute("src") || "";
        if (imgUrlToOpen.startsWith("https://")) {
          e.preventDefault();
          imgMenu().popup({ window: remote.getCurrentWindow() });
        }
        break;
      case "TEXTAREA":
      case "INPUT":
        e.preventDefault();
        textEditMenu().popup({ window: remote.getCurrentWindow() });
        break;
      default:
        if (isAnyTextSelected()) {
          e.preventDefault();
          normalMenu.popup({ window: remote.getCurrentWindow() });
        }
    }
  },
  false
);
