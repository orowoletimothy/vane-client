import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useNotificationStore } from '@/store/notification-store'

interface PushNotificationState {
  isSupported: boolean
  isSubscribed: boolean
  isLoading: boolean
  error: string | null
  subscription: PushSubscription | null
  subscribe: () => Promise<void>
  unsubscribe: () => Promise<void>
}

export function usePushNotifications(): PushNotificationState {
  const { user } = useAuthStore()
  const { savePushSubscription } = useNotificationStore()
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  // VAPID public key from server
  const vapidPublicKey = 'BLBz5U6_3VsHksHbxwJr9TX_QQrCdGqhDxpWbQl9FCohPh9-xHmAYla2xTF2Y_LGYb2tSGzSK3hDV6pcHOBcIQM'

  // Convert base64 VAPID public key to Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Check if push notifications are supported and get subscription status
  useEffect(() => {
    const checkPushSupport = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if service workers and push messaging are supported
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
          setIsSupported(false)
          setIsLoading(false)
          return
        }

        setIsSupported(true)

        // Register service worker if not already registered
        const registration = await navigator.serviceWorker.register('/service-worker.js')
        
        // Check if already subscribed
        const existingSubscription = await registration.pushManager.getSubscription()
        
        if (existingSubscription) {
          setSubscription(existingSubscription)
          setIsSubscribed(true)
        }
      } catch (err) {
        console.error('Error checking push notification support:', err)
        setError('Failed to initialize push notifications')
      } finally {
        setIsLoading(false)
      }
    }

    checkPushSupport()
  }, [])

  // Subscribe to push notifications
  const subscribe = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!isSupported) {
        throw new Error('Push notifications are not supported in this browser')
      }

      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Permission for notifications was denied')
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      }

      const newSubscription = await registration.pushManager.subscribe(subscriptionOptions)
      setSubscription(newSubscription)
      setIsSubscribed(true)

      // Save subscription on server
      if (user?._id) {
        await savePushSubscription(user._id, newSubscription)
      }

      return newSubscription
    } catch (err: any) {
      console.error('Error subscribing to push notifications:', err)
      setError(err.message || 'Failed to subscribe to push notifications')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!subscription) {
        throw new Error('No active subscription found')
      }

      // Unsubscribe from push manager
      await subscription.unsubscribe()
      setSubscription(null)
      setIsSubscribed(false)

      // TODO: Notify server about unsubscription if needed

    } catch (err: any) {
      console.error('Error unsubscribing from push notifications:', err)
      setError(err.message || 'Failed to unsubscribe from push notifications')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscription,
    subscribe,
    unsubscribe
  }
}