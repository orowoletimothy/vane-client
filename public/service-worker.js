// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message,
      icon: '/placeholder-logo.png',
      badge: '/placeholder-logo.png',
      data: data,
      vibrate: [100, 50, 100],
      actions: [
        {
          action: 'view',
          title: 'View'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const data = event.notification.data;
  let url = '/';

  if (data) {
    if (data.type === 'HABIT_REMINDER' && data.habitId) {
      url = `/habits?id=${data.habitId}`;
    } else if (data.type === 'FRIEND_REQUEST') {
      url = '/social';
    } else if (data.type === 'STREAK_MILESTONE') {
      url = '/profile';
    }
  }

  event.waitUntil(
    clients.matchAll({type: 'window'}).then(function(clientList) {
      // If a tab is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});