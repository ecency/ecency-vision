export function getOperatingSystem(agent: string) {
  let operatingSystem = "WindowsOS";

  if (agent.indexOf("Win") !== -1) {
    operatingSystem = "WindowsOS";
  }

  if (agent.indexOf("Mac") !== -1) {
    operatingSystem = "MacOS";
  }

  if (agent.indexOf("X11") !== -1) {
    operatingSystem = "UnixOS";
  }

  if (agent.indexOf("Linux") !== -1) {
    operatingSystem = "LinuxOS";
  }

  if (agent.indexOf("Android") !== -1) {
    operatingSystem = "AndroidOS";
  }

  if (agent.indexOf("iPhone") !== -1) {
    operatingSystem = "iOS";
  }

  if (agent.indexOf("iPad") !== -1) {
    operatingSystem = "iOS";
  }

  return operatingSystem;
}

export default (window: any): string => getOperatingSystem(window.navigator.appVersion);
