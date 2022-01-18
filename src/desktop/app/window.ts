import { IpcRenderer, Remote } from "electron";

import { AppWindow } from "../../client/window";

export interface DesktopWindow extends AppWindow {
  ipcRenderer: IpcRenderer;
  remote: Remote;
}
