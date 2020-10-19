import {IpcRenderer, Remote} from "electron";

export interface DesktopWindow extends Window {
    ipcRenderer: IpcRenderer;
    remote: Remote
}

