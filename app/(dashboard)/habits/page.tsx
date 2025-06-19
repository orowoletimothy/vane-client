"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useHabitStore } from "@/store/habit-store"
import { AddHabitDialog } from "@/components/add-habit-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { inter } from "@/lib/fonts"

const habitCategories = [
  {
    id: "health",
    name: "Health",
    description: "Like eating better",
    color: "bg-green-100",
    illustration: "🥗",
  },
  {
    id: "fitness",
    name: "Fitness",
    description: "Like stretching everyday",
    color: "bg-blue-100",
    illustration: "💪",
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Like plan tomorrow",
    color: "bg-purple-100",
    illustration: "📋",
  },
  {
    id: "education",
    name: "Education",
    description: "Like learning a language",
    color: "bg-yellow-100",
    illustration: "📚",
  },
  {
    id: "wellness",
    name: "Wellness",
    description: "Like meditate",
    color: "bg-pink-100",
    illustration: "🧘",
  },
  {
    id: "relationships",
    name: "Relationships",
    description: "Like family time",
    color: "bg-orange-100",
    illustration: "👥",
  },
  {
    id: "money",
    name: "Money",
    description: "Like checking cryptos",
    color: "bg-emerald-100",
    illustration: "💰",
  },
  {
    id: "hobbies",
    name: "Hobbies",
    description: "Like playing the guitar",
    color: "bg-indigo-100",
    illustration: "🎸",
  },
  {
    id: "chores",
    name: "Chores",
    description: "Like doing bed",
    color: "bg-amber-100",
    illustration: "🏠",
  },
]

export default function HabitsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddHabit, setShowAddHabit] = useState(false)
  const router = useRouter()
  const { getHabitsByCategory } = useHabitStore()

  const filteredCategories = habitCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Habits</h1>
          </div>
          <Button variant="ghost" size="sm">
            <Search size={20} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-0 shadow-sm"
          />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredCategories.map((category) => {
            const categoryHabits = getHabitsByCategory(category.id)

            return (
              <Card
                key={category.id}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/habits/${category.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center text-2xl`}
                      >
                        {category.illustration}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-gray-600">{category.description}</p>
                        {categoryHabits.length > 0 && (
                          <p className="text-sm text-amber-600 font-medium mt-1">
                            {categoryHabits.length} habit{categoryHabits.length !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAddHabit(true)
                      }}
                      className="text-amber-600 hover:text-amber-700"
                    >
                      <Plus size={20} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Add Custom Habit */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
              ✨
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">None of these fit you?</h3>
            <Button onClick={() => setShowAddHabit(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
              Create a custom habit
            </Button>
          </CardContent>
        </Card>
      </div>

      <AddHabitDialog open={showAddHabit} onOpenChange={setShowAddHabit} />
    </div>
  )
}
