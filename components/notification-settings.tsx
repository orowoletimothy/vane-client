"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useNotificationStore, NotificationPreferences } from "@/store/notification-store"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, BellOff, AlertCircle } from "lucide-react"

export function NotificationSettings() {
  const { user } = useAuthStore()
  const { updateNotificationPreferences } = useNotificationStore()
  const { 
    isSupported, 
    isSubscribed, 
    isLoading, 
    error, 
    subscribe, 
    unsubscribe 
  } = usePushNotifications()

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    friendRequests: true,
    habitReminders: true,
    streakMilestones: true
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Handle push notification subscription
  const handlePushSubscription = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe()
      } else {
        await subscribe()
      }
    } catch (err) {
      // Error is already handled in the hook
    }
  }

  // Handle preference changes
  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setSaveSuccess(false)
  }

  // Save preferences
  const savePreferences = async () => {
    if (!user?._id) return
    
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    
    try {
      await updateNotificationPreferences(user._id, preferences)
      setSaveSuccess(true)
    } catch (err) {
      setSaveError("Failed to save notification preferences")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Manage how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Push Notifications</h3>
          
          {!isSupported ? (
            <div className="flex items-center p-3 bg-amber-50 text-amber-800 rounded-md">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p className="text-sm">Push notifications are not supported in your browser.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Enable Push Notifications</Label>
                <p className="text-sm text-gray-500">
                  Receive notifications even when the app is closed
                </p>
              </div>
              <Button
                variant={isSubscribed ? "destructive" : "default"}
                size="sm"
                onClick={handlePushSubscription}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Loading..."
                ) : isSubscribed ? (
                  <>
                    <BellOff className="mr-2 h-4 w-4" />
                    Disable
                  </>
                ) : (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Enable
                  </>
                )}
              </Button>
            </div>
          )}
          
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Notification Types Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="habit-reminders">Habit Reminders</Label>
                <p className="text-sm text-gray-500">
                  Get reminded when it's time to complete your habits
                </p>
              </div>
              <Switch
                id="habit-reminders"
                checked={preferences.habitReminders}
                onCheckedChange={() => handlePreferenceChange('habitReminders')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="friend-requests">Friend Requests</Label>
                <p className="text-sm text-gray-500">
                  Get notified when someone sends you a friend request
                </p>
              </div>
              <Switch
                id="friend-requests"
                checked={preferences.friendRequests}
                onCheckedChange={() => handlePreferenceChange('friendRequests')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="streak-milestones">Streak Milestones</Label>
                <p className="text-sm text-gray-500">
                  Celebrate when you reach streak milestones
                </p>
              </div>
              <Switch
                id="streak-milestones"
                checked={preferences.streakMilestones}
                onCheckedChange={() => handlePreferenceChange('streakMilestones')}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {saveSuccess && (
          <p className="text-sm text-green-600">Settings saved successfully!</p>
        )}
        {saveError && (
          <p className="text-sm text-red-500">{saveError}</p>
        )}
        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  )
}