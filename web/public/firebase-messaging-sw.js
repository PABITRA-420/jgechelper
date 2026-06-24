// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCX14ch5GE2Jj_peWkDKwvoH6w9846ZIMw",
    authDomain: "jgechelper.firebaseapp.com",
    projectId: "jgechelper",
    storageBucket: "jgechelper.firebasestorage.app",
    messagingSenderId: "313685962455",
    appId: "1:313685962455:web:ef85ed28bb6235ad7fca92"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    const notificationTitle = payload.notification?.title || "New Update";
    const notificationOptions = {
        body: payload.notification?.body || "Check out the latest changes on JGECHelper.",
        icon: '/globe.svg',
        badge: '/globe.svg',
        data: payload.data || {},
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Extract url from payload data
    const urlToOpen = event.notification.data?.link || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window open with this URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open a new tab/window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
