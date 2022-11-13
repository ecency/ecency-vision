export function requestNotificationPermission(): Promise<NotificationPermission> {
  return new Promise((resolve) => {
    const request = Notification.requestPermission();
    // In Safari, it could return undefined
    if (request === undefined) {
      Notification.requestPermission((permission) => {
        resolve(permission);
      });
    }
    request.then((permission) => resolve(permission));
  });
}
