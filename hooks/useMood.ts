import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"

export interface Mood {
  _id: string
  userId: string
  mood: string
  motivation: string
  date: string
  dateString: string
  createdAt: string
  updatedAt: string
}

// Get today's mood
export function useTodayMood() {
  return useQuery({
    queryKey: ["mood", "today"],
    queryFn: async (): Promise<Mood | null> => {
      try {
        const response = await api.get("/mood/today")
        return response.data
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null // No mood for today yet
        }
        throw error
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour - mood doesn't change frequently
  })
}

// Get mood history
export function useMoodHistory(limit: number = 30) {
  return useQuery({
    queryKey: ["mood", "history", limit],
    queryFn: async (): Promise<Mood[]> => {
      const response = await api.get(`/mood/history?limit=${limit}`)
      return response.data
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  })
}

// Save mood mutation
export function useSaveMood() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ mood, motivation }: { mood: string; motivation?: string }) => {
      const response = await api.post("/mood", { mood, motivation })
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch mood data
      queryClient.invalidateQueries({ queryKey: ["mood"] })
    },
  })
} 