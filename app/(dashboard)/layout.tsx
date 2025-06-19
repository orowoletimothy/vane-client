"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { DailyMoodModal } from "@/components/daily-mood-modal";
import { useTodayMood } from "@/hooks/useMood";
import { useAuthStore } from "@/store/auth-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [hasCheckedMood, setHasCheckedMood] = useState(false);
  const { user } = useAuthStore();
  const { data: todayMood, isLoading: isMoodLoading } = useTodayMood();

  useEffect(() => {
    // Only show modal if user is logged in, mood data is loaded, and no mood for today
    if (user && !isMoodLoading && !hasCheckedMood) {
      setHasCheckedMood(true);

      // Show modal if no mood recorded for today
      if (!todayMood) {
        // Add small delay to ensure smooth page load
        setTimeout(() => {
          setShowMoodModal(true);
        }, 1000);
      }
    }
  }, [user, todayMood, isMoodLoading, hasCheckedMood]);

  const handleMoodModalClose = () => {
    setShowMoodModal(false);
  };

  const handleMoodSaved = () => {
    setShowMoodModal(false);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>

      {/* Daily Mood Modal */}
      <DailyMoodModal
        isOpen={showMoodModal}
        onClose={handleMoodModalClose}
        onMoodSaved={handleMoodSaved}
      />
    </SidebarProvider>
  );
}
