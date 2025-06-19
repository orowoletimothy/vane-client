"use client"

import { useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { NotificationSettings } from "@/components/notification-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore()
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [isVacationMode, setIsVacationMode] = useState(user?.is_vacation || false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleProfileSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      // Update profile in the store
      updateProfile({
        displayName,
        is_vacation: isVacationMode
      })

      // TODO: Add API call to update profile on server

      setSaveSuccess(true)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>
              Please log in to access settings
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="vacation-mode">Vacation Mode</Label>
                  <p className="text-sm text-gray-500">
                    Pause habit tracking while you're away
                  </p>
                </div>
                <Switch
                  id="vacation-mode"
                  checked={isVacationMode}
                  onCheckedChange={setIsVacationMode}
                />
              </div>

              {saveSuccess && (
                <p className="text-sm text-green-600">Profile updated successfully!</p>
              )}

              <Button onClick={handleProfileSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}