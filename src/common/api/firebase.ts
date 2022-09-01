import { getMessaging, getToken, MessagePayload, Messaging, onMessage } from "@firebase/messaging";
import { FirebaseApp, initializeApp } from "@firebase/app";
import { Analytics, getAnalytics, logEvent } from "@firebase/analytics";

let app: FirebaseApp;
export let FCM: Messaging;
export let FA: Analytics;

export function initFirebase(initMessaging = true) {
  if (typeof window === "undefined") {
    return;
  }

  app = initializeApp({
    apiKey: "AIzaSyDKF-JWDMmUs5ozjK7ZdgG4beHRsAMd2Yw",
    authDomain: "esteem-ded08.firebaseapp.com",
    databaseURL: "https://esteem-ded08.firebaseio.com",
    projectId: "esteem-ded08",
    storageBucket: "esteem-ded08.appspot.com",
    messagingSenderId: "211285790917",
    appId: "1:211285790917:web:c259d25ed1834c683760ac",
    measurementId: "G-TYQD1N3NR3"
  });
  if (initMessaging) {
    FCM = getMessaging(app);
  }
  FA = getAnalytics(app);

  logEvent(FA, "test-event");
}

export const handleMessage = (payload: MessagePayload) => {
  const notificationTitle = payload.notification?.title || "Ecency";

  const notification = new Notification(notificationTitle, {
    body: payload.notification?.body,
    icon: payload.notification?.image
  });

  notification.onclick = () => {
    let url = "https://ecency.com";
    const data = (payload.data || {}) as any;
    const fullPermlink = data.permlink1 + data.permlink2 + data.permlink3;

    if (["vote", "unvote", "spin", "inactive"].includes(data.type)) {
      url += "/@" + data.target;
    } else {
      // delegation, mention, transfer, follow, unfollow, ignore, blacklist, reblog
      url += "/@" + data.source;
    }
    if (fullPermlink) {
      url += "/" + fullPermlink;
    }

    window.open(url, "_blank");
  };
};

export const getFcmToken = () =>
  getToken(FCM, {
    vapidKey:
      "BA3SrGKAKMU_6PXOFwD9EQ1wIPzyYt90Q9ByWb3CkazBe8Isg7xr9Cgy0ka6SctHDW0VZLShTV_UDYNxewzWDjk"
  });

export const listenFCM = (callback: Function) => {
  onMessage(FCM, (p) => {
    //console.log('Received fg message', p);
    handleMessage(p);
    callback();
  });
};
