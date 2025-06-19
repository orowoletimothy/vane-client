"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import { useHabits } from "@/hooks/useHabits"
import { useAuthStore } from "@/store/auth-store"
import { type Habit } from "@/store/habit-store"
import { HabitCard } from "@/components/habit-card"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { HabitDetailsDialog } from "@/components/habit-details-dialog"
import { EditHabitDialog } from "@/components/edit-habit-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { inter } from "@/lib/fonts"
import { useQueryClient } from "@tanstack/react-query"
import { NotificationBell } from "@/components/notification-bell"
import { useSetHabitStatus } from "@/hooks/useHabits";

const DAYS_OF_WEEK_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export default function DashboardPage() {
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [habitProgress, setHabitProgress] = useState<{ [id: string]: number }>({})

  const { user } = useAuthStore();
  const setHabitStatus = useSetHabitStatus(user?._id || "");
  const { data: todayHabits = [], isLoading, isError } = useHabits(user?._id || "");

  useEffect(() => {
    // Initialize local progress from backend data
    if (todayHabits.length > 0) {
      const progress: { [id: string]: number } = {};
      todayHabits.forEach((habit: Habit) => {
        progress[habit.id] = habit.completedToday || 0;
      });
      setHabitProgress(progress);
    }
  }, [todayHabits]);

  const calculateTodayProgress = () => {
    if (todayHabits.length === 0) return 0
    const completed = todayHabits.filter((habit: Habit) => habit.completedToday >= habit.target_count).length
    return Math.round((completed / todayHabits.length) * 100)
  }

  const todayProgress = calculateTodayProgress()

  // Filter habits based on active tab
  // Initialize queryClient at the component level, not inside an event handler
  const queryClient = useQueryClient();

  const filteredHabits = activeTab === "all"
    ? todayHabits
    : todayHabits.filter((habit: Habit) => habit.status === activeTab)

  const handleHabitClick = (habit: Habit) => {
    // Update the habit in the list if it has changed
    if (habit.completedToday !== undefined) {
      const updatedHabits = todayHabits.map((h: Habit) =>
        h.id === habit.id ? habit : h
      );
      // Force a re-render with the updated habit data
      // This is a workaround since we can't directly modify the query cache
      queryClient.setQueryData(["habits", user?._id], updatedHabits);
    }

    setSelectedHabit(habit)
    setShowDetailsDialog(true)
  }

  const handleEditFromDetails = (habit: Habit) => {
    setSelectedHabit(habit)
    setShowDetailsDialog(false)
    setShowEditDialog(true)
  }

  const handleHabitProgressClick = (habit: Habit) => {
    const current = habitProgress[habit.id] || 0;
    if (current < habit.target_count) {
      // Increment local progress
      const newProgress = current + 1;
      setHabitProgress(prev => ({
        ...prev,
        [habit.id]: newProgress
      }));
      // If reached target, call backend to mark as complete
      if (newProgress === habit.target_count) {
        setHabitStatus.mutateAsync({ habitId: habit.id, status: "complete" });
      }
    } else {
      // Reset to 0 and mark as incomplete
      setHabitProgress(prev => ({
        ...prev,
        [habit.id]: 0
      }));
      setHabitStatus.mutateAsync({ habitId: habit.id, status: "incomplete" });
    }
  };

  // Generate dates for the week display
  const today = new Date()
  const currentDayOfWeek = today.getDay()
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - currentDayOfWeek + i)
    return {
      day: DAYS_OF_WEEK_SHORT[date.getDay()],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    }
  })

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Today</h1>
            </div>
            <div className="flex items-center space-x-2">
              {user && (
                <div className="flex items-center bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-xs font-semibold mr-2">
                  <span className="mr-1">🔥</span>
                  <span>Streak: {user.genStreakCount || 0}</span>
                </div>
              )}
              <NotificationBell />
              <Button
                onClick={() => setShowAddHabit(true)}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus size={20} />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Loading habits...</p>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}>
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Today</h1>
            </div>
            <div className="flex items-center space-x-2">
              <NotificationBell />
              {user && (
                <div className="flex items-center bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-xs font-semibold mr-2">
                  <span className="mr-1">🔥</span>
                  <span>Streak: {user.genStreakCount || 0}</span>
                </div>
              )}
              <Button
                onClick={() => setShowAddHabit(true)}
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus size={20} />
              </Button>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-6">
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600">Error loading habits. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Today</h1>
          </div>
          <div className="flex items-center space-x-2">
            <NotificationBell />
            {user && (
              <div className="flex items-center bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-xs font-semibold mr-2">
                <span className="mr-1">🔥</span>
                <span>Streak: {user.genStreakCount || 0}</span>
              </div>
            )}
            <Button
              onClick={() => setShowAddHabit(true)}
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus size={20} />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Date selector */}
        <div className="flex justify-center space-x-4">
          {weekDates.map((dayData) => (
            <button
              key={dayData.day + dayData.date}
              className={`flex flex-col items-center p-2 rounded-xl transition-colors ${dayData.isToday ? "bg-white shadow-md" : "hover:bg-white/50"
                }`}
            >
              <span className="text-xs text-gray-500 mb-1">{dayData.day}</span>
              <span className={`text-lg font-semibold ${dayData.isToday ? "text-gray-900" : "text-gray-600"}`}>
                {dayData.date}
              </span>
            </button>
          ))}
        </div>

        {/* Progress overview */}
        {todayHabits.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Today's Progress</h3>
                  <p className="text-gray-600">{todayProgress}% completed</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                      strokeDasharray={`${todayProgress}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-900">{todayProgress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Categories Tab Bar */}
        {todayHabits.length > 0 && (
          <div className="flex justify-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-md">
            {["all", "incomplete", "complete", "paused"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                className={`capitalize ${activeTab === tab ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-gray-600"}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {/* Habits list */}
        <div className="space-y-4">
          {todayHabits.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-orange-200 to-amber-200 rounded-3xl flex items-center justify-center">
                  <div className="text-4xl">🎯</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  It seems like you don't have any habits to track
                </h3>
                <p className="text-gray-600 mb-6">Start building better habits today!</p>
                <Button onClick={() => setShowAddHabit(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
                  Add a habit
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredHabits.map((habit: Habit) => (
              <HabitCard
                key={habit.id}
                habit={{ ...habit, completedToday: habitProgress[habit.id] || 0 }}
                onClick={() => handleHabitProgressClick(habit)}
                showCompleteButton={true}
              />
            ))
          )}
        </div>
      </div>

      <AddHabitDialog open={showAddHabit} onOpenChange={setShowAddHabit} />
      <HabitDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        habit={selectedHabit}
        onEdit={handleEditFromDetails}
      />
      <EditHabitDialog open={showEditDialog} onOpenChange={setShowEditDialog} habit={selectedHabit} />
    </div>
  )
}
