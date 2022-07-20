import { getMessaging, getToken, MessagePayload, Messaging, onMessage } from '@firebase/messaging';
import { FirebaseApp, initializeApp } from '@firebase/app';
import { _t } from '../i18n';

let app: FirebaseApp;
let FCM: Messaging;

export function initFirebase() {
  if (typeof window === 'undefined') {
    return;
  }

  app = initializeApp({
    apiKey: 'AIzaSyDKF-JWDMmUs5ozjK7ZdgG4beHRsAMd2Yw',
    authDomain: 'esteem-ded08.firebaseapp.com',
    databaseURL: 'https://esteem-ded08.firebaseio.com',
    projectId: 'esteem-ded08',
    storageBucket: 'esteem-ded08.appspot.com',
    messagingSenderId: '211285790917',
    appId: '1:211285790917:web:c259d25ed1834c683760ac',
    measurementId: 'G-TYQD1N3NR3'
  });
  FCM = getMessaging(app);
}

export const notificationBody = (data: any): string => {
  const { source } = data;

  switch (data.type) {
    case 'vote':
      return _t('notification.voted', { source });
    case 'mention':
      return data.extra.is_post === 1
        ? _t('notification.mention-post', { source })
        : _t('notification.mention-comment', { source });
    case 'follow':
      return _t('notification.followed', { source });
    case 'reply':
      return _t('notification.replied', { source });
    case 'reblog':
      return _t('notification.reblogged', { source });
    case 'transfer':
      return _t('notification.transfer', { source, amount: data.extra.amount });
    case 'delegations':
      return _t('notification.delegations', { source, amount: data.extra.amount });
    default:
      return '';
  }
};

const handleMessage = (payload: MessagePayload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification?.title || 'Ecency';

  new Notification(notificationTitle, {
    body: payload.notification?.body,
    icon: payload.notification?.image,
  });
}

export const getFcmToken = () => getToken(FCM, {
  vapidKey: 'BA3SrGKAKMU_6PXOFwD9EQ1wIPzyYt90Q9ByWb3CkazBe8Isg7xr9Cgy0ka6SctHDW0VZLShTV_UDYNxewzWDjk'
});

export const listenFCM = async (isBackground: boolean, callback: Function) => {

  // if (isBackground) {
  //   onBackgroundMessage(FCM, p => handleMessage(p));
  // } else {
    onMessage(FCM, p => {
      handleMessage(p);
      callback();
    });
  // }
}