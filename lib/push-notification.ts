// Client-side push notification setup

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration, vapidPublicKey: string) {
  try {
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      return subscription;
    }

    // Convert VAPID key to array buffer
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
    
    // Subscribe
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
    
    console.log('Push notification subscription successful:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications() {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const result = await subscription.unsubscribe();
      return result;
    }
    
    return true; // Already unsubscribed
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

// Helper function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}