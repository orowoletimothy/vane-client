"use client";

import { useTodayMood } from "@/hooks/useMood";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DailyMoodModal } from "./daily-mood-modal";

export function MoodIndicator() {
  const { data: todayMood, isLoading } = useTodayMood();
  const [showMoodModal, setShowMoodModal] = useState(false);

  if (isLoading) return null;

  if (!todayMood) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMoodModal(true)}
          className="text-xs px-2 py-1 h-7"
        >
          Add mood
        </Button>
        <DailyMoodModal
          isOpen={showMoodModal}
          onClose={() => setShowMoodModal(false)}
          onMoodSaved={() => setShowMoodModal(false)}
        />
      </>
    );
  }

  return (
    <Card
      className="px-2 py-1 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => setShowMoodModal(true)}
      title={`Today's mood: ${todayMood.motivation || "Click to update"}`}
    >
      <div className="flex items-center space-x-1">
        <span className="text-lg">{todayMood.mood}</span>
        <span className="text-xs text-gray-600">Today</span>
      </div>
      <DailyMoodModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onMoodSaved={() => setShowMoodModal(false)}
      />
    </Card>
  );
}
