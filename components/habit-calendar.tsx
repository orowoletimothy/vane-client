"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Habit } from "@/store/habit-store"

interface HabitCalendarProps {
  habit: Habit
  completionData: Record<string, number> // date -> completion count
}

export function HabitCalendar({ habit, completionData }: HabitCalendarProps) {
  const calendarData = useMemo(() => {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1) // 6 months ago
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0) // End of current month

    const weeks: Array<Array<{ date: Date; completion: number; isToday: boolean }>> = []
    let currentWeek: Array<{ date: Date; completion: number; isToday: boolean }> = []

    // Start from the first day of the week containing startDate
    const firstDay = new Date(startDate)
    firstDay.setDate(startDate.getDate() - startDate.getDay())

    const currentDate = new Date(firstDay)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().slice(0, 10)
      const completion = completionData[dateStr] || 0
      const isToday = currentDate.toDateString() === today.toDateString()

      currentWeek.push({
        date: new Date(currentDate),
        completion,
        isToday,
      })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks
  }, [completionData])

  const getIntensityClass = (completion: number, target: number) => {
    if (completion === 0) return "bg-gray-100"
    const ratio = completion / target
    if (ratio >= 1) return "bg-green-500"
    if (ratio >= 0.75) return "bg-green-400"
    if (ratio >= 0.5) return "bg-green-300"
    if (ratio >= 0.25) return "bg-green-200"
    return "bg-green-100"
  }

  const totalDays = Object.keys(completionData).length
  const completedDays = Object.values(completionData).filter((count) => count >= habit.target_count).length
  const consistencyRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{habit.icon}</span>
            <span>{habit.title}</span>
          </div>
          <div className="text-sm text-gray-600">{consistencyRate}% consistent</div>
        </CardTitle>
        <p className="text-sm text-gray-600">
          {habit.target_count} time{habit.target_count > 1 ? "s" : ""} per day
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex space-x-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getIntensityClass(day.completion, habit.target_count)} ${
                    day.isToday ? "ring-2 ring-amber-400" : ""
                  }`}
                  title={`${day.date.toLocaleDateString()}: ${day.completion}/${habit.target_count} completed`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm" />
            <div className="w-3 h-3 bg-green-200 rounded-sm" />
            <div className="w-3 h-3 bg-green-300 rounded-sm" />
            <div className="w-3 h-3 bg-green-400 rounded-sm" />
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}
