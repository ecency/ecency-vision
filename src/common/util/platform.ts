function getOperatingSystem(window: { navigator: { appVersion: string | string[]; }; }) {
  let operatingSystem = 'Not known';
  if (window.navigator.appVersion.indexOf('Win') !== -1) { operatingSystem = 'WindowsOS'; }
  if (window.navigator.appVersion.indexOf('Mac') !== -1) { operatingSystem = 'MacOS'; }
  if (window.navigator.appVersion.indexOf('X11') !== -1) { operatingSystem = 'UnixOS'; }
  if (window.navigator.appVersion.indexOf('Linux') !== -1) { operatingSystem = 'LinuxOS'; }
  if (window.navigator.appVersion.indexOf('Android') !== -1) { operatingSystem = 'AndroidOS'; }
  if (window.navigator.appVersion.indexOf('iPhone') !== -1) { operatingSystem = 'iOS'; }
  if (window.navigator.appVersion.indexOf('iPad') !== -1) { operatingSystem = 'iOS'; }

  return operatingSystem;
}
export default (window: any): string => getOperatingSystem(window);