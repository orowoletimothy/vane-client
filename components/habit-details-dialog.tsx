"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type Habit } from "@/store/habit-store"
import { Pencil, PauseCircle, Trash2, Edit, Pause, Play } from "lucide-react"
import { useDeleteHabit } from "@/hooks/useHabits"
import { useAuthStore } from "@/store/auth-store"
import { useSetHabitStatus } from "@/hooks/useHabits"

interface HabitDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit: Habit | null
  onEdit: (habit: Habit) => void
}

const DAYS_OF_WEEK_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DAYS_OF_WEEK_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function HabitDetailsDialog({ open, onOpenChange, habit, onEdit }: HabitDetailsDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { user } = useAuthStore()
  const deleteHabitHook = useDeleteHabit(user?._id || "")
  const setHabitStatus = useSetHabitStatus(user?._id || "")

  if (!habit) return null

  const handlePause = async () => {
    if (!habit || setHabitStatus.isPending) return;
    await setHabitStatus.mutateAsync({ habitId: habit.id, status: "paused" });
    onOpenChange(false)
  }

  const handleDelete = async () => {
    if (habit) {
      await deleteHabitHook.mutateAsync(habit.id)
      onOpenChange(false)
    }
  }

  const formattedHabitDays =
    habit.habit_days.length === 0
      ? "Every Day"
      : habit.habit_days.map((day) => DAYS_OF_WEEK_FULL[DAYS_OF_WEEK_SHORT.indexOf(day)]).join(", ")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-3xl">{habit.icon}</span>
            {habit.title}
          </DialogTitle>
          <DialogDescription>Details and actions for your habit.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Goal:</p>
            <p className="font-medium">{habit.target_count || 0} times per day</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Scheduled Days:</p>
            <p className="font-medium">{formattedHabitDays || "Every Day"}</p>
          </div>
          {habit.reminder_time && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Reminder:</p>
              <p className="font-medium">{habit.reminder_time}</p>
            </div>
          )}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Status:</p>
            <Badge variant={habit.status === "complete" ? "default" : "secondary"}>{habit.status || "incomplete"}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Visibility:</p>
            <Badge variant="outline">{habit.is_public ? "Public" : "Private"}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">Current Streak:</p>
            <p className="font-medium">{habit.streak || 0} days {habit.streak > 0 ? "🔥" : ""}</p>
          </div>
          {habit.notes && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Notes:</p>
              <p className="text-sm bg-gray-50 p-2 rounded-md">{habit.notes}</p>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onEdit(habit)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="outline" onClick={handlePause} disabled={habit.status === "paused"}>
            <Pause className="mr-2 h-4 w-4" /> Pause
          </Button>
          {!confirmDelete ? (
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          ) : (
            <div className="space-y-2 mt-4">
              <p className="text-sm text-gray-600 text-center">Are you sure you want to delete this habit?</p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={deleteHabitHook.isPending}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
