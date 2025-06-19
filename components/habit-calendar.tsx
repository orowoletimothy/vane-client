"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Habit } from "@/store/habit-store";

interface HabitCalendarProps {
  habit: Habit;
  completionData: Record<string, number | null>; // date -> completion count (null = before habit created)
  targetCount?: number;
  totalDays?: number;
  completedDays?: number;
}

// Color themes for different habits
const habitColorThemes = [
  {
    name: "Purple",
    empty: "bg-gray-50 border-gray-200 text-gray-400",
    partial: "bg-purple-100 border-purple-200 text-purple-600",
    complete: "bg-purple-500 border-purple-500 text-white",
    accent: "text-purple-600 bg-purple-50",
    button: "hover:bg-purple-50",
  },
  {
    name: "Green",
    empty: "bg-gray-50 border-gray-200 text-gray-400",
    partial: "bg-green-100 border-green-200 text-green-600",
    complete: "bg-green-500 border-green-500 text-white",
    accent: "text-green-600 bg-green-50",
    button: "hover:bg-green-50",
  },
  {
    name: "Blue",
    empty: "bg-gray-50 border-gray-200 text-gray-400",
    partial: "bg-blue-100 border-blue-200 text-blue-600",
    complete: "bg-blue-500 border-blue-500 text-white",
    accent: "text-blue-600 bg-blue-50",
    button: "hover:bg-blue-50",
  },
  {
    name: "Red",
    empty: "bg-gray-50 border-gray-200 text-gray-400",
    partial: "bg-red-100 border-red-200 text-red-600",
    complete: "bg-red-500 border-red-500 text-white",
    accent: "text-red-600 bg-red-50",
    button: "hover:bg-red-50",
  },
  {
    name: "Orange",
    empty: "bg-gray-50 border-gray-200 text-gray-400",
    partial: "bg-orange-100 border-orange-200 text-orange-600",
    complete: "bg-orange-500 border-orange-500 text-white",
    accent: "text-orange-600 bg-orange-50",
    button: "hover:bg-orange-50",
  },
  {
    name: "Pink",
    empty: "bg-gray-50 border-gray-200 text-gray-400",
    partial: "bg-pink-100 border-pink-200 text-pink-600",
    complete: "bg-pink-500 border-pink-500 text-white",
    accent: "text-pink-600 bg-pink-50",
    button: "hover:bg-pink-50",
  },
];

// Get color theme based on habit ID (deterministic)
const getHabitColorTheme = (habitId: string) => {
  const hash = habitId.split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
  return habitColorThemes[Math.abs(hash) % habitColorThemes.length];
};

export function HabitCalendar({
  habit,
  completionData,
  targetCount,
  totalDays,
  completedDays,
}: HabitCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const colorTheme = getHabitColorTheme(habit.id);
  const target = targetCount || habit.target_count;

  // Generate calendar data for the current month
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Get last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Get the day of week for the first day (0 = Sunday)
    const startDayOfWeek = firstDayOfMonth.getDay();

    // Calculate how many days to show from previous month
    const daysFromPrevMonth = startDayOfWeek;

    // Start date (might be from previous month)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(firstDayOfMonth.getDate() - daysFromPrevMonth);

    // Generate 6 weeks of calendar data (42 days total)
    const weeks = [];
    const currentDateIter = new Date(startDate);

    for (let week = 0; week < 6; week++) {
      const weekDays = [];

      for (let day = 0; day < 7; day++) {
        const dateStr = currentDateIter.toISOString().slice(0, 10);
        const completion = completionData[dateStr];
        const isCurrentMonth = currentDateIter.getMonth() === month;
        const isToday =
          currentDateIter.toDateString() === new Date().toDateString();
        const isBeforeHabit = completion === null;

        weekDays.push({
          date: new Date(currentDateIter),
          dateStr,
          completion,
          isCurrentMonth,
          isToday,
          isBeforeHabit,
          dayNumber: currentDateIter.getDate(),
        });

        currentDateIter.setDate(currentDateIter.getDate() + 1);
      }

      weeks.push(weekDays);
    }

    return weeks;
  }, [currentDate, completionData]);

  const getDayClass = (
    completion: number | null,
    isCurrentMonth: boolean,
    isToday: boolean,
    isBeforeHabit: boolean
  ) => {
    let baseClass =
      "w-10 h-10 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all cursor-pointer hover:scale-105";

    if (!isCurrentMonth) {
      return `${baseClass} bg-gray-50 border-gray-100 text-gray-300`;
    }

    if (isBeforeHabit) {
      return `${baseClass} bg-gray-100 border-gray-200 text-gray-400`;
    }

    if (completion === null || completion === 0) {
      baseClass += ` ${colorTheme.empty}`;
    } else if (completion >= target) {
      baseClass += ` ${colorTheme.complete}`;
    } else {
      baseClass += ` ${colorTheme.partial}`;
    }

    if (isToday) {
      baseClass += " ring-2 ring-offset-2 ring-blue-400";
    }

    return baseClass;
  };

  const getTooltipText = (date: Date, completion: number | null) => {
    const dateStr = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (completion === null) {
      return `${dateStr}: Habit not created yet`;
    }

    if (completion === 0) {
      return `${dateStr}: Not completed`;
    }

    const status = completion >= target ? " ✓ Target reached!" : "";
    return `${dateStr}: ${completion}/${target} completed${status}`;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate stats for current month
  const currentMonthStats = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    let completedDays = 0;
    let totalDays = 0;
    let currentStreak = 0;

    // Check each day of the current month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      const completion = completionData[dateStr];

      if (completion !== null) {
        totalDays++;
        if (completion > 0) {
          completedDays++;
        }
      }
    }

    // Calculate current streak (going backwards from today)
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const completion = completionData[dateStr];

      if (completion === null) break;
      if (completion === 0) break;

      currentStreak++;
    }

    const percentage =
      totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return { completedDays, totalDays, percentage, currentStreak };
  }, [currentDate, completionData, target]);

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{habit.icon}</span>
            <div>
              <CardTitle className="text-lg">{habit.title}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Target: {target} time{target > 1 ? "s" : ""} per day
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={colorTheme.accent}>
              {currentMonthStats.percentage}% this month
            </Badge>
            {currentMonthStats.currentStreak > 0 && (
              <Badge variant="secondary">
                🔥 {currentMonthStats.currentStreak} days
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className={colorTheme.button}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">{monthName}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs"
            >
              Today
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className={colorTheme.button}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={getDayClass(
                    day.completion,
                    day.isCurrentMonth,
                    day.isToday,
                    day.isBeforeHabit
                  )}
                  title={getTooltipText(day.date, day.completion)}
                >
                  {day.dayNumber}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Monthly Stats */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t text-sm text-gray-600">
          <span>
            {currentMonthStats.completedDays} of {currentMonthStats.totalDays}{" "}
            days completed
          </span>
          <span>Best streak: {habit.streak || 0} days</span>
        </div>
      </CardContent>
    </Card>
  );
}
