import { getAuthUrl } from "../../../common/helper/hive-signer";

import { DesktopWindow } from "../window";

declare var window: DesktopWindow;

const REDIR = "http://127.0.0.1:3415/";

const windowSettings = {
  center: true,
  width: 800,
  height: 700,
  minWidth: 800,
  minHeight: 700,
  maxWidth: 800,
  maxHeight: 700,
  maximizable: false,
  alwaysOnTop: true,
  webPreferences: {
    enableRemoteModule: true,
    nodeIntegration: true,
    contextIsolation: false,
    worldSafeExecuteJavaScript: false
  }
};

const createWindowView = (redirectUrl: string): string => {
  const content = encodeURIComponent(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Redirecting...</title>
        <meta charset="UTF-8">
        <style>
        body {
          align-items: center;
          background: #ccc;
          display: flex;
          font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
          height: 100%;
          justify-content: center;
          left: 0;
          margin: 0;
          padding: 0;
          position: absolute;
          top: 0;
          width: 100%;
        }
        .wrapper {
          width: 90%;
          margin: auto;
          text-align: center;
          word-break: break-word;
        }
        .url {
          color: #357ce6
        }
        </style>
      </head>
      <body>
        <div class="wrapper">You are redirecting to <span class="url">${redirectUrl}</span></div>
        <script>
            setTimeout(()=>{
              window.location.href = '${redirectUrl}';
            }, 2000)
        </script>
      </body>
    </html>
  `);

  return `data:text/html;charset=UTF-8, ${content}`;
};

export const hsLogin = (hsClientId : string): Promise<{ code: string }> =>
  new Promise((resolve, reject) => {
    const win = new window.remote.BrowserWindow(windowSettings);
    win.webContents.setUserAgent(`Chrome/77.0.3835.0`);

    const authUrl = getAuthUrl(REDIR);

    win.loadURL(createWindowView(authUrl));

    const windowInt = setInterval(() => {
      let url;

      try {
        url = win.webContents.getURL();
      } catch (e) {
        clearInterval(windowInt);
        reject("Window is not reachable");
        return;
      }

      if (url.startsWith(REDIR)) {
        const parsedUrl = new URL(url);
        const code = parsedUrl.searchParams.get("code");

        if (code) {
          resolve({
            code
          });
        } else {
          reject("Couldn't get code");
        }

        clearInterval(windowInt);
        win.close();
      }
    }, 200);
  });
