import { create } from "zustand"
import api from "@/lib/api"

export interface Notification {
  _id: string
  userId: string
  habitId?: {
    _id: string
    title: string
  }
  title: string
  message: string
  type: "HABIT_REMINDER" | "FRIEND_REQUEST" | "STREAK_MILESTONE"
  isRead: boolean
  scheduledFor: string
  status: "PENDING" | "SENT" | "FAILED"
  createdAt: string
  updatedAt: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  savePushSubscription: (userId: string, subscription: PushSubscription) => Promise<void>
  updateNotificationPreferences: (userId: string, preferences: NotificationPreferences) => Promise<void>
}

export interface NotificationPreferences {
  friendRequests?: boolean
  habitReminders?: boolean
  streakMilestones?: boolean
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async (userId: string) => {
    if (!userId) return

    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get(`/notifications/${userId}`)
      set({
        notifications: data,
        unreadCount: data.filter((notification: Notification) => !notification.isRead).length,
        isLoading: false
      })
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      set({ error: "Failed to fetch notifications", isLoading: false })
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await api.put(`/notification/${notificationId}/read`)
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: state.unreadCount - 1 < 0 ? 0 : state.unreadCount - 1
      }))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      set((state) => {
        const notification = state.notifications.find(n => n._id === notificationId)
        const unreadCount = notification && !notification.isRead
          ? state.unreadCount - 1
          : state.unreadCount

        return {
          notifications: state.notifications.filter(n => n._id !== notificationId),
          unreadCount: unreadCount < 0 ? 0 : unreadCount
        }
      })
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  },

  savePushSubscription: async (userId: string, subscription: PushSubscription) => {
    try {
      await api.post(`/notification/${userId}/push-subscription`, subscription)
    } catch (error) {
      console.error("Failed to save push subscription:", error)
    }
  },

  updateNotificationPreferences: async (userId: string, preferences: NotificationPreferences) => {
    try {
      await api.put(`/notification/${userId}/preferences`, preferences)
    } catch (error) {
      console.error("Failed to update notification preferences:", error)
    }
  }
}))