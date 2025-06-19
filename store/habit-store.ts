import { create } from "zustand"

export type HabitStatus = "complete" | "incomplete" | "paused"

export interface Habit {
  id: string // uuid
  user_id: string // uuid
  title: string // text
  reminder_time?: string // timestamptz (ISO string, optional)
  status: HabitStatus
  is_public: boolean // bool
  target_count: number // int4
  created_at: string // timestamptz (ISO string)
  updated_at: string // timestamptz (ISO string)
  streak: number // int4 (current streak for this habit)
  habit_days: string[] // _accepted_days (e.g., ["Mon", "Tue"])
  last_completed?: string // timestamptz (ISO string, optional)
  notes?: string // varchar (optional)
  icon: string // text (emoji)
  // Frontend-only fields for daily tracking
  completedToday: number // Client-side counter for current day's progress
}

export interface HabitCategory {
  id: string
  name: string
  emoji: string
  color: string
  habits: Habit[]
}

interface HabitState {
  habits: Habit[]
  categories: HabitCategory[]
  todayProgress: number
  restorePoints: number
  addHabit: (
    habit: Omit<Habit, "id" | "user_id" | "created_at" | "updated_at" | "streak" | "status" | "completedToday">,
  ) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  completeHabit: (id: string) => void
  pauseHabit: (id: string) => void
  getTodayHabits: () => Habit[]
  getHabitsByCategory: (category: string) => Habit[]
}

const defaultCategories: HabitCategory[] = [
  { id: "health", name: "Health", emoji: "🥗", color: "bg-green-100", habits: [] },
  { id: "fitness", name: "Fitness", emoji: "💪", color: "bg-blue-100", habits: [] },
  { id: "productivity", name: "Productivity", emoji: "📋", color: "bg-purple-100", habits: [] },
  { id: "education", name: "Education", emoji: "📚", color: "bg-yellow-100", habits: [] },
  { id: "wellness", name: "Wellness", emoji: "🧘", color: "bg-pink-100", habits: [] },
  { id: "relationships", name: "Relationships", emoji: "👥", color: "bg-orange-100", habits: [] },
]

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const useHabitStore = create<HabitState>()(() => ({
  habits: [],
  categories: defaultCategories,
  todayProgress: 0,
  restorePoints: 3,
  addHabit: () => { },
  updateHabit: () => { },
  deleteHabit: () => { },
  completeHabit: () => { },
  pauseHabit: () => { },
  getTodayHabits: () => [],
  getHabitsByCategory: () => [],
}))
