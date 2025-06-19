"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Check, ChevronRight } from "lucide-react"
import { type Habit } from "@/store/habit-store"
import { useSetHabitStatus } from "@/hooks/useHabits"
import { useAuthStore } from "@/store/auth-store"

interface HabitCardProps {
  habit: Habit
  onClick: (habit: Habit) => void
  showCompleteButton?: boolean
}

export function HabitCard({ habit, onClick, showCompleteButton = true }: HabitCardProps) {
  const { user } = useAuthStore()
  const setHabitStatus = useSetHabitStatus(user?._id || "")

  const isCompleted = habit.completedToday >= habit.target_count;
  const completedToday = typeof habit.completedToday === "number" ? habit.completedToday : 0;
  const targetCount = typeof habit.target_count === "number" && habit.target_count > 0 ? habit.target_count : 1;
  const progress = targetCount > 0 ? Math.min((completedToday / targetCount) * 100, 100) : 0;

  return (
    <Card
      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
      onClick={() => onClick(habit)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showCompleteButton && (
              <Button
                onClick={e => { e.stopPropagation(); onClick(habit); }}
                size="sm"
                className={`w-10 h-10 rounded-full ${isCompleted
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
              >
                {isCompleted ? <Check size={16} /> : <Plus size={16} />}
              </Button>
            )}

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{habit.icon || "📌"}</span>
                <h3 className="font-semibold text-gray-900">{habit.title || "Untitled Habit"}</h3>
              </div>
              <p className="text-sm text-gray-600">
                {completedToday} of {targetCount} times today
              </p>
              {(habit.streak > 0) && <p className="text-xs text-amber-600 font-medium">🔥 {habit.streak} day streak</p>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Progress indicator */}
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={isCompleted ? "#10b981" : "#f59e0b"}
                  strokeWidth="3"
                  strokeDasharray={`${progress}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-900">{Math.round(progress)}%</span>
              </div>
            </div>

            <Button variant="ghost" size="sm">
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
