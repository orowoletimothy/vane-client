"use client"

import { useEffect } from "react"
import { useNotificationStore } from "@/store/notification-store"
import { Badge } from "@/components/ui/badge"

interface NotificationBadgeProps {
  className?: string
}

export function NotificationBadge({ className }: NotificationBadgeProps) {
  const { unreadCount, fetchNotifications } = useNotificationStore()
  
  useEffect(() => {
    // Fetch notifications on mount
    fetchNotifications()
    
    // Set up polling for new notifications
    const intervalId = setInterval(() => {
      fetchNotifications()
    }, 60000) // Check every minute
    
    return () => clearInterval(intervalId)
  }, [])
  
  if (unreadCount <= 0) return null
  
  return (
    <Badge 
      variant="destructive" 
      className={`absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs ${className}`}
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </Badge>
  )
}