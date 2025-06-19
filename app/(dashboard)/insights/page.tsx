"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useHabitStore } from "@/store/habit-store"
import { useAuthStore } from "@/store/auth-store"
import { HabitCalendar } from "@/components/habit-calendar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { TrendingUp, Target, Calendar, Award, Flame, Clock } from "lucide-react"
import { inter } from "@/lib/fonts"

export default function InsightsPage() {
  const { habits } = useHabitStore()
  const { user } = useAuthStore()

  // Generate mock completion data for demonstration
  const generateMockCompletionData = (habit: any) => {
    const data: Record<string, number> = {}
    const today = new Date()

    for (let i = 180; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateStr = date.toISOString().slice(0, 10)

      // Simulate completion patterns based on habit
      const dayOfWeek = date.getDay()
      const isScheduledDay =
        habit.habit_days.length === 0 ||
        habit.habit_days.includes(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek])

      if (isScheduledDay) {
        // Simulate 70-90% consistency with some randomness
        const completionRate = 0.7 + Math.random() * 0.2
        const shouldComplete = Math.random() < completionRate
        data[dateStr] = shouldComplete
          ? Math.min(habit.target_count, Math.floor(Math.random() * habit.target_count) + 1)
          : 0
      } else {
        data[dateStr] = 0
      }
    }

    return data
  }

  const analyticsData = useMemo(() => {
    const activeHabits = habits.filter((h) => h.status !== "paused")
    const totalHabits = habits.length
    const pausedHabits = habits.filter((h) => h.status === "paused").length

    const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0)
    const averageStreak = totalHabits > 0 ? Math.round(totalStreaks / totalHabits) : 0

    const longestStreak = Math.max(...habits.map((h) => h.streak), 0)

    // Calculate this week's completion rate
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    let weeklyCompletions = 0
    let weeklyTargets = 0

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]

      activeHabits.forEach((habit) => {
        if (habit.habit_days.length === 0 || habit.habit_days.includes(dayName)) {
          weeklyTargets += habit.target_count
          // Mock completion for this calculation
          weeklyCompletions += Math.floor(Math.random() * habit.target_count)
        }
      })
    }

    const weeklyCompletionRate = weeklyTargets > 0 ? Math.round((weeklyCompletions / weeklyTargets) * 100) : 0

    return {
      totalHabits,
      activeHabits: activeHabits.length,
      pausedHabits,
      averageStreak,
      longestStreak,
      weeklyCompletionRate,
      currentStreak: user?.genStreakCount || 0,
    }
  }, [habits, user])

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Insights</h1>
          </div>
          <Badge variant="outline" className="text-amber-600 border-amber-200">
            <Calendar className="w-4 h-4 mr-1" />
            Last 6 months
          </Badge>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalHabits}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.activeHabits} active, {analyticsData.pausedHabits} paused
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.currentStreak}</div>
              <p className="text-xs text-muted-foreground">Longest: {analyticsData.longestStreak} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.weeklyCompletionRate}%</div>
              <Progress value={analyticsData.weeklyCompletionRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Streak</CardTitle>
              <Award className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.averageStreak}</div>
              <p className="text-xs text-muted-foreground">Across all habits</p>
            </CardContent>
          </Card>
        </div>

        {/* Habit Calendars */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Habit Consistency</h2>

          {habits.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl flex items-center justify-center">
                  <Target className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No habits to analyze</h3>
                <p className="text-gray-600">Create some habits to see your consistency patterns here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {habits.map((habit) => (
                <HabitCalendar key={habit.id} habit={habit} completionData={generateMockCompletionData(habit)} />
              ))}
            </div>
          )}
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Best Performance Times</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Morning (6-12 PM)</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={85} className="w-20" />
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Afternoon (12-6 PM)</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={72} className="w-20" />
                    <span className="text-sm font-medium">72%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Evening (6-12 AM)</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={68} className="w-20" />
                    <span className="text-sm font-medium">68%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Weekly Trends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => {
                  const performance = [92, 88, 85, 90, 87, 75, 70][index]
                  return (
                    <div key={day} className="flex justify-between items-center">
                      <span className="text-sm">{day}</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={performance} className="w-20" />
                        <span className="text-sm font-medium">{performance}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
