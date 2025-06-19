"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  useCreateHabit,
  useHabits,
  useCheckHabitFeasibility,
} from "@/hooks/useHabits";
import { useAuthStore } from "@/store/auth-store";
import { AxiosError } from "axios";
import { HabitFeasibilityDisplay } from "./habit-feasibility-display";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const habitEmojis = [
  "💧",
  "🏃",
  "📚",
  "🥗",
  "🧘",
  "💪",
  "🎯",
  "📝",
  "🎨",
  "🎵",
  "🌱",
  "☀️",
  "🌙",
  "⭐",
  "🔥",
  "💎",
  "🏆",
  "🎪",
  "🎭",
  "🎮",
];

const DAYS_OF_WEEK_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AddHabitDialog({ open, onOpenChange }: AddHabitDialogProps) {
  const { user } = useAuthStore();
  const { data: habits, isLoading } = useHabits(user?._id || "");

  const [formData, setFormData] = useState({
    title: "",
    icon: "🎯",
    target_count: 1,
    habit_days: [] as string[], // Use habit_days instead of frequency
    isPublic: false,
    reminderTime: "",
    notes: "",
  });

  const [feasibilityResult, setFeasibilityResult] = useState<any>(null);
  const [showFeasibilityCheck, setShowFeasibilityCheck] = useState(false);

  const createHabit = useCreateHabit(user?._id || "");
  const checkFeasibility = useCheckHabitFeasibility(user?._id || "");

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const newHabitDays = prev.habit_days.includes(day)
        ? prev.habit_days.filter((d) => d !== day)
        : [...prev.habit_days, day];
      return { ...prev, habit_days: newHabitDays };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.reminderTime) {
      // First check feasibility unless we already have a result or user chose to skip
      if (!feasibilityResult && !showFeasibilityCheck) {
        checkFeasibility.mutate(
          {
            ...formData,
          },
          {
            onSuccess: (response) => {
              setFeasibilityResult(response.feasibility);
              setShowFeasibilityCheck(true);
            },
            onError: (error) => {
              console.error("Feasibility check failed:", error);
              // Proceed with creation if feasibility check fails
              proceedWithCreation();
            },
          }
        );
        return;
      }

      // If we have feasibility result, proceed with creation
      proceedWithCreation();
    }
  };

  const proceedWithCreation = (skipFeasibilityCheck = false) => {
    console.log("Creating habit with:", formData, user?._id);
    createHabit.mutate(
      {
        ...formData,
        skipFeasibilityCheck,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      {
        onSuccess: () => {
          // Reset form and close dialog on success
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setFormData({
      title: "",
      icon: "🎯",
      target_count: 1,
      habit_days: [],
      isPublic: false,
      reminderTime: "",
      notes: "",
    });
    setFeasibilityResult(null);
    setShowFeasibilityCheck(false);
    onOpenChange(false);
  };

  const handleFeasibilityProceed = () => {
    proceedWithCreation(true);
  };

  const handleFeasibilityCancel = () => {
    setShowFeasibilityCheck(false);
    setFeasibilityResult(null);
  };

  if (!user?._id) return null; // or show a loading spinner

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>

        {showFeasibilityCheck && feasibilityResult ? (
          <div className="space-y-4">
            <HabitFeasibilityDisplay
              feasibility={feasibilityResult}
              onProceed={handleFeasibilityProceed}
              onCancel={handleFeasibilityCancel}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Drink water, Read books"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Choose an Emoji</Label>
              <div className="grid grid-cols-10 gap-2">
                {habitEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: emoji })}
                    className={`w-8 h-8 text-lg rounded hover:bg-gray-100 ${
                      formData.icon === emoji
                        ? "bg-amber-100 ring-2 ring-amber-500"
                        : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Goal (times per day)</Label>
                <Input
                  id="goal"
                  type="number"
                  min="1"
                  value={formData.target_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_count: Number.parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderTime">Reminder Time</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={formData.reminderTime}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, reminderTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Days to perform</Label>
              <div className="flex justify-between">
                {DAYS_OF_WEEK_SHORT.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={
                      formData.habit_days.includes(day) ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleDayToggle(day)}
                    className={
                      formData.habit_days.includes(day)
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : ""
                    }
                  >
                    {day}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Select no days for a daily habit.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add any notes about this habit"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic">Make this habit public</Label>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: checked })
                }
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600"
              >
                Create Habit
              </Button>
            </div>

            {createHabit.isError && (
              <div className="text-red-500 text-sm">
                {(createHabit.error as AxiosError<{ message: string }>)
                  ?.response?.data?.message || "Failed to create habit."}
              </div>
            )}
            {createHabit.isPending && (
              <div className="text-gray-500 text-sm">Creating habit...</div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
