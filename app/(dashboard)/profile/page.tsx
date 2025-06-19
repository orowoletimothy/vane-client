"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/auth-store";
import { Habit, useHabitStore } from "@/store/habit-store";
import {
  Camera,
  Save,
  Plane,
  User,
  Calendar,
  Award,
  Flame,
  AlertTriangle,
} from "lucide-react";
import { inter } from "@/lib/fonts";
import { useAllHabits } from "@/hooks/useHabits";

export default function ProfilePage() {
  const { user, updateProfile, toggleVacationMode, getDisplayName } =
    useAuthStore();
  const {
    data: habits = [],
    isLoading: habitsLoading,
    error: habitsError,
  } = useAllHabits(user?._id || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(
    user?.displayName || user?.username || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Please log in
          </h2>
          <p className="text-gray-600">
            You need to be logged in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const handleSaveDisplayName = async () => {
    if (!displayName.trim()) return;

    setIsSaving(true);
    try {
      await updateProfile({ displayName: displayName.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update display name:", error);
      // Reset display name on error
      setDisplayName(user?.displayName || user?.username || "");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      // For demo purposes, using object URL. In production, upload to storage service
      const imageUrl = URL.createObjectURL(file);
      await updateProfile({ profilePicture: imageUrl });
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVacationToggle = async () => {
    try {
      await toggleVacationMode();
    } catch (error) {
      console.error("Failed to toggle vacation mode:", error);
    }
  };

  const activeHabits = habits.filter((h: Habit) => h.status !== "paused");
  const totalStreak = user?.longest_streak;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}
    >
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage
                    src={user.profilePicture || "/placeholder.svg"}
                    alt={getDisplayName()}
                  />
                  <AvatarFallback className="text-2xl bg-amber-100 text-amber-700">
                    {getDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getDisplayName()}
                  </h2>
                  {user.is_vacation && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-700"
                    >
                      <Plane className="w-3 h-3 mr-1" />
                      On Vacation
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-4">@{user.username}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {activeHabits.length}
                    </div>
                    <div className="text-sm text-gray-600">Active Habits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {user.genStreakCount}
                    </div>
                    <div className="text-sm text-gray-600">Current Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {user.longest_streak}
                    </div>
                    <div className="text-sm text-gray-600">Longest Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {user.recovery_points}
                    </div>
                    <div className="text-sm text-gray-600">Recovery Points</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={user.username}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Username cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <div className="flex space-x-2">
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing}
                    placeholder={user.username}
                  />
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleSaveDisplayName}
                        disabled={isSaving || !displayName.trim()}
                      >
                        {isSaving ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setDisplayName(user.displayName || user.username);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  This is how your name appears to others
                </p>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(user.date_joined).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vacation Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plane className="w-5 h-5" />
                <span>Vacation Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="vacation-mode">Enable Vacation Mode</Label>
                  <p className="text-sm text-gray-600">
                    Pause streak counting while you're away
                  </p>
                </div>
                <Switch
                  id="vacation-mode"
                  checked={user.is_vacation}
                  onCheckedChange={handleVacationToggle}
                />
              </div>

              {user.is_vacation && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Vacation mode is active. Your streaks won't be affected by
                    missed days, but you also won't gain streak days while this
                    is enabled.
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">
                  What happens in vacation mode?
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Your current streaks are preserved</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Missing days won't break your streaks</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <span>You can still complete habits if you want</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                    <span>Streak counting resumes when you return</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Account Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                <Flame className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {totalStreak}
                </div>
                <div className="text-sm text-gray-600">Total Streak Days</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {user?.totalHabits || habits.length}
                </div>
                <div className="text-sm text-gray-600">
                  Total Habits Created
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg">
                <Calendar className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {user?.date_joined
                    ? Math.floor(
                        (Date.now() - new Date(user.date_joined).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}
                </div>
                <div className="text-sm text-gray-600">Days Since Joining</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
