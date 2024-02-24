import {IpcRenderer} from "electron";

import {AppWindow} from "../../client/window";

export interface DesktopWindow extends AppWindow {
    ipcRenderer: IpcRenderer;
    remote: any
}

