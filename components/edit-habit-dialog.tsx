"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useUpdateHabit } from "@/hooks/useHabits"
import { useAuthStore } from "@/store/auth-store"

interface EditHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit: Habit | null
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
  "🎮"
]

const DAYS_OF_WEEK_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function EditHabitDialog({ open, onOpenChange, habit }: EditHabitDialogProps) {
  const { user } = useAuthStore();
  const updateHabit = useUpdateHabit(user?._id || "");
  const [formData, setFormData] = useState<HabitFormData>({
    title: "",
    icon: "🎯",
    target_count: 1,
    habit_days: [],
    is_public: false,
    reminder_time: undefined,
    notes: undefined,
    last_completed: undefined,
  })

  useEffect(() => {
    if (habit) {
      setFormData({
        title: habit.title,
        icon: habit.icon,
        target_count: habit.target_count,
        habit_days: habit.habit_days,
        is_public: habit.is_public,
        reminder_time: habit.reminder_time || "",
        notes: habit.notes || "",
        last_completed: habit.last_completed,
      })
    }
  }, [habit])

  const handleDayToggle = (day: string) => {
    setFormData((prev) => {
      const newHabitDays = prev.habit_days.includes(day)
        ? prev.habit_days.filter((d) => d !== day)
        : [...prev.habit_days, day]
      return { ...prev, habit_days: newHabitDays }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (habit && formData.title) {
      updateHabit.mutate(
        {
          habitId: habit.id, // or habit._id depending on your backend
          updates: {
            title: formData.title,
            icon: formData.icon,
            target_count: formData.target_count,
            habit_days: formData.habit_days,
            is_public: formData.is_public,
            reminder_time: formData.reminder_time || undefined,
            notes: formData.notes || undefined,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
          },
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Habit Name</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  className={`w-8 h-8 text-lg rounded hover:bg-gray-100 ${formData.icon === emoji ? "bg-amber-100 ring-2 ring-amber-500" : ""
                    }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_count">Goal (times per day)</Label>
              <Input
                id="target_count"
                type="number"
                min="1"
                value={formData.target_count}
                onChange={(e) => setFormData({ ...formData, target_count: Number.parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder_time">Reminder Time (Optional)</Label>
              <Input
                id="reminder_time"
                type="time"
                value={formData.reminder_time}
                onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
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
                  variant={formData.habit_days.includes(day) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDayToggle(day)}
                  className={formData.habit_days.includes(day) ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
                >
                  {day}
                </Button>
              ))}
            </div>
            <p className="text-xs text-gray-500">Select no days for a daily habit.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this habit"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_public">Make this habit public</Label>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Define a local type for form data that omits 'status' from Habit
import type { Habit } from "@/store/habit-store"
type HabitFormData = Omit<Habit, "id" | "user_id" | "created_at" | "updated_at" | "streak" | "completedToday" | "status">;
