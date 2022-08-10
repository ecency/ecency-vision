// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
  apiKey: 'AIzaSyDKF-JWDMmUs5ozjK7ZdgG4beHRsAMd2Yw',
  authDomain: 'esteem-ded08.firebaseapp.com',
  databaseURL: 'https://esteem-ded08.firebaseio.com',
  projectId: 'esteem-ded08',
  storageBucket: 'esteem-ded08.appspot.com',
  messagingSenderId: '211285790917',
  appId: '1:211285790917:web:c259d25ed1834c683760ac',
  measurementId: 'G-TYQD1N3NR3'
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  //console.log('Received bg notification', payload);
  const notificationTitle = payload.notification?.title || 'Ecency';

  self.registration.showNotification(notificationTitle, {
    body: payload.notification?.body,
    icon: payload.notification?.image || 'https://ecency.com/static/media/logo-circle.2df6f251.svg',
    data: payload.data,
  });
});

self.addEventListener('notificationclick', function (event) {
  const data = event.notification.data;
  let url = 'https://ecency.com';

  if (data.parent_permlink1) {
    url += '/' + data.parent_permlink1;
  }
  if (['vote', 'unvote', 'reply', 'spin', 'inactive'].includes(data.type)) {
    url += '/@' + data.target;
  } else {
    // delegation, mention, transfer, follow, unfollow, ignore, blacklist, reblog
    url += '/@' + data.source;
  }
  if (data.permlink1) {
    url += '/' + data.permlink1;
  }

  clients.openWindow(url, '_blank');
});