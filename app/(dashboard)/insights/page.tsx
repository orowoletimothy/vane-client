"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useAllHabits,
  useHabitCompletionHistory,
  useUserPerformanceAnalytics,
} from "@/hooks/useHabits";
import { useAuthStore } from "@/store/auth-store";
import { HabitCalendar } from "@/components/habit-calendar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Habit } from "@/store/habit-store";
import {
  TrendingUp,
  Target,
  Calendar,
  Award,
  Flame,
  Clock,
} from "lucide-react";
import { inter } from "@/lib/fonts";

export default function InsightsPage() {
  const { user } = useAuthStore();
  console.log("User:", user);
  console.log("User ID:", user?._id);

  const {
    data: habits = [],
    isLoading: habitsLoading,
    error: habitsError,
  } = useAllHabits(user?._id || "");

  const {
    data: performanceData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useUserPerformanceAnalytics(user?._id || "", 90);

  console.log("Habits from API:", habits);
  console.log("Analytics from API:", performanceData);

  const analyticsData = useMemo(() => {
    const activeHabits = habits?.filter((h: Habit) => h.status !== "paused");
    const totalHabits = habits.length;
    const pausedHabits = habits.filter(
      (h: Habit) => h.status === "paused"
    ).length;

    const totalStreaks = habits?.reduce(
      (sum: number, habit: Habit) => sum + habit.streak,
      0
    );
    const averageStreak =
      totalHabits > 0 ? Math.round(totalStreaks / totalHabits) : 0;

    const longestStreak = Math.max(...habits?.map((h: Habit) => h.streak), 0);

    // Calculate this week's completion rate
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    let weeklyCompletions = 0;
    let weeklyTargets = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        date.getDay()
      ];

      activeHabits.forEach((habit: Habit) => {
        if (
          habit.habit_days.length === 0 ||
          habit.habit_days.includes(dayName)
        ) {
          weeklyTargets += habit.target_count;
          // Count completed habits for this calculation
          if (habit.status === "complete") {
            weeklyCompletions += habit.target_count;
          }
        }
      });
    }

    const weeklyCompletionRate =
      weeklyTargets > 0
        ? Math.round((weeklyCompletions / weeklyTargets) * 100)
        : 0;

    return {
      totalHabits,
      activeHabits: activeHabits.length,
      pausedHabits,
      averageStreak,
      longestStreak,
      weeklyCompletionRate,
      currentStreak: user?.genStreakCount || longestStreak,
    };
  }, [habits, user]);

  if (habitsLoading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}
      >
        <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Insights</h1>
            </div>
          </div>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (habitsError) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}
      >
        <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">Insights</h1>
            </div>
          </div>
        </div>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">
              Error loading habits. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}
    >
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
              <CardTitle className="text-sm font-medium">
                Total Habits
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.totalHabits}
              </div>
              <p className="text-xs text-muted-foreground">
                {analyticsData.activeHabits} active,{" "}
                {analyticsData.pausedHabits} paused
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Longest Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.longestStreak}
              </div>
              <p className="text-xs text-muted-foreground">
                Average: {analyticsData.averageStreak} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.weeklyCompletionRate}%
              </div>
              <Progress
                value={analyticsData.weeklyCompletionRate}
                className="mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Streak
              </CardTitle>
              <Award className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.averageStreak}
              </div>
              <p className="text-xs text-muted-foreground">Across all habits</p>
            </CardContent>
          </Card>
        </div>

        {/* Habit Calendars */}
        <HabitConsistencySection habits={habits} userId={user?._id || ""} />

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
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Morning (6-12 AM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={performanceData?.timeOfDay?.morning || 0}
                        className="w-20"
                      />
                      <span className="text-sm font-medium">
                        {performanceData?.timeOfDay?.morning || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Afternoon (12-6 PM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={performanceData?.timeOfDay?.afternoon || 0}
                        className="w-20"
                      />
                      <span className="text-sm font-medium">
                        {performanceData?.timeOfDay?.afternoon || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Evening (6-12 PM)</span>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={performanceData?.timeOfDay?.evening || 0}
                        className="w-20"
                      />
                      <span className="text-sm font-medium">
                        {performanceData?.timeOfDay?.evening || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { name: "Monday", key: "monday" },
                    { name: "Tuesday", key: "tuesday" },
                    { name: "Wednesday", key: "wednesday" },
                    { name: "Thursday", key: "thursday" },
                    { name: "Friday", key: "friday" },
                    { name: "Saturday", key: "saturday" },
                    { name: "Sunday", key: "sunday" },
                  ].map((day) => {
                    const performance =
                      performanceData?.dayOfWeek?.[day.key] || 0;
                    return (
                      <div
                        key={day.name}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">{day.name}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={performance} className="w-20" />
                          <span className="text-sm font-medium">
                            {performance}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Separate component for habit consistency section
function HabitConsistencySection({
  habits,
  userId,
}: {
  habits: Habit[];
  userId: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Habit Consistency</h2>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No habits to analyze
            </h3>
            <p className="text-gray-600">
              Create some habits to see your consistency patterns here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 grid lg:grid-cols-3 md:grid-cols-1 sm:grid-cols-1 gap-4">
          {habits.map((habit) => (
            <HabitCalendarWithData
              key={habit.id}
              habit={habit}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Component to fetch completion data for each habit
function HabitCalendarWithData({
  habit,
  userId,
}: {
  habit: Habit;
  userId: string;
}) {
  const {
    data: historyData,
    isLoading,
    error,
  } = useHabitCompletionHistory(userId, habit.id, 180);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading habit data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-red-600">Error loading habit data</p>
        </CardContent>
      </Card>
    );
  }

  if (!historyData) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-gray-600">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <HabitCalendar
      habit={habit}
      completionData={historyData.completionData || {}}
      targetCount={historyData.targetCount}
      totalDays={historyData.totalDays}
      completedDays={historyData.completedDays}
    />
  );
}
