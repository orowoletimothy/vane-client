"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"
import { useNotificationStore, Notification } from "@/store/notification-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationBell() {
  const { user } = useAuthStore()
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    deleteNotification 
  } = useNotificationStore()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (user?._id) {
      fetchNotifications(user._id)
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchNotifications(user._id)
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [user, fetchNotifications])

  // Handle opening the dropdown
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
  }

  // Handle clicking on a notification
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    
    // Handle navigation based on notification type
    if (notification.type === "HABIT_REMINDER" && notification.habitId) {
      // Navigate to the habit
      window.location.href = `/habits?id=${notification.habitId._id}`
    } else if (notification.type === "FRIEND_REQUEST") {
      // Navigate to social page
      window.location.href = "/social"
    }
  }

  // Format the notification time
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case "HABIT_REMINDER":
        return "🎯"
      case "FRIEND_REQUEST":
        return "👋"
      case "STREAK_MILESTONE":
        return "🔥"
      default:
        return "📣"
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 font-medium border-b">Notifications</div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No notifications
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification._id} 
                className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-amber-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{notification.title}</div>
                    <div className="text-sm text-gray-600 truncate">{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatNotificationTime(notification.createdAt)}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notification._id)
                    }}
                  >
                    ×
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}