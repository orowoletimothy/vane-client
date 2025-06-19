import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import api from "@/lib/api"

interface User {
  _id: string
  username: string
  displayName: string
  email: string
  profilePicture: string
  habitIds: string[]
  taskIds: string[]
  friends: string[]
  friendRequests: string[]
  genStreakCount: number
  userTimeZone?: string
  createdAt: string
  longest_streak: number
  recovery_points: number
  is_vacation: boolean
  totalStreakDays?: number
  totalHabits?: number
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  updateProfile: (updates: Partial<Pick<User, "displayName" | "profilePicture">>) => Promise<void>
  toggleVacationMode: () => Promise<void>
  getDisplayName: () => string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        console.log('Setting user:', user)
        set({ user, isAuthenticated: true })
      },
      logout: async () => {
        try {
          await api.post("/auth/logout", {}, {
            headers: {
              'Content-Type': 'application/json'
            },
            withCredentials: true
          })
          set({ user: null, isAuthenticated: false })
        } catch (error) {
          console.error("Logout failed:", error)
          set({ user: null, isAuthenticated: false })
        }
      },
      updateProfile: async (updates) => {
        try {
          const response = await api.patch("/auth/profile", updates, {
            headers: {
              'Content-Type': 'application/json'
            },
            withCredentials: true
          })

          if (response.data.user) {
            set((state) => ({
              user: state.user ? { ...state.user, ...response.data.user } : null,
            }))
          }
        } catch (error) {
          console.error("Failed to update profile:", error)
          throw error
        }
      },
      toggleVacationMode: async () => {
        try {
          const response = await api.post("/auth/vacation-mode", {}, {
            headers: {
              'Content-Type': 'application/json'
            },
            withCredentials: true
          })

          if (response.data.user) {
            set((state) => ({
              user: state.user ? { ...state.user, ...response.data.user } : null,
            }))
          }
        } catch (error) {
          console.error("Failed to toggle vacation mode:", error)
          throw error
        }
      },
      getDisplayName: () => {
        const state = get()
        return state.user?.displayName || "User"
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
