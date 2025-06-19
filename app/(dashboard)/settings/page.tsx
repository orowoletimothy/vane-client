"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { NotificationSettings } from "@/components/notification-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isVacationMode, setIsVacationMode] = useState(
    user?.is_vacation || false
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to access settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 p-2">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="p-4">
        <NotificationSettings />
      </div>
    </div>
  );
}
