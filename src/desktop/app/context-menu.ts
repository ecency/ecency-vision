import { ipcRenderer, shell, clipboard, Menu } from "electron";

import { _t } from "../../common/i18n";

const isAnyTextSelected = () => window.getSelection() && window.getSelection()!.toString() !== '';

const itemCut = () => ({
    label: _t('context-menu.cut'),
    click: () => {
        document.execCommand('cut');
    }
});

const itemCopy = () => ({
    label: _t('context-menu.copy'),
    click: () => {
        document.execCommand('copy');
    }
});

const itemPaste = () => ({
    label: _t('context-menu.paste'),
    click: () => {
        document.execCommand('paste');
    }
});

let imgUrlToOpen = '';
const itemImgOpen = () => ({
    label: _t('context-menu.open-image-browser'),
    click: () => {
        shell.openExternal(imgUrlToOpen);
    }
});

const itemImgCopyUrl = () => ({
    label: _t('context-menu.copy-image-url'),
    click: () => {
        clipboard.writeText(imgUrlToOpen);
    }
});

let menuTemplate: any[] | null = null;

const normalMenuTemplate = [itemCopy()];

const textEditMenuTemplate = [itemCut(), itemCopy(), itemPaste()];

const imgMenuTemplate = [itemImgOpen(), itemImgCopyUrl()];

document.addEventListener(
    'contextmenu',
    (e: MouseEvent) => {
        const target = e.target as HTMLElement;

        switch (target.nodeName) {
            case 'IMG':
                imgUrlToOpen = target.getAttribute('src') || '';
                if (imgUrlToOpen.startsWith('https://')) {
                    e.preventDefault();
                    menuTemplate = imgMenuTemplate;
                }
                break;
            case 'TEXTAREA':
            case 'INPUT':
                e.preventDefault();
                menuTemplate = textEditMenuTemplate;
                break;
            default:
                if (isAnyTextSelected()) {
                    e.preventDefault();
                    menuTemplate = normalMenuTemplate;
                }
        }

        if (menuTemplate) {
            const menu = Menu.buildFromTemplate(menuTemplate);
            menu.popup();
        }
    },
    false
);