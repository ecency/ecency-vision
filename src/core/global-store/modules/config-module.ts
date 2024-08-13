import config from "../../../config/ecency-config.json";

export function createConfigState() {
  if (!config.visionConfig) {
    return {
      config: {
        notifications: {
          enabled: false
        }
      }
    };
  }

  return {
    config
  };
}
