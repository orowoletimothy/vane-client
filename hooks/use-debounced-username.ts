"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"

export function useDebouncedUsername(username: string, delay = 500) {
  const [debouncedUsername, setDebouncedUsername] = useState(username)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsername(username)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [username, delay])

  const {
    data: isAvailable,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["username-availability", debouncedUsername],
    queryFn: async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        return null
      }

      try {
        const response = await api.get(`/auth/check-username/${debouncedUsername}`)
        return response.data.available
      } catch (error) {
        if (error.response?.status === 404) {
          return true // Username is available
        }
        throw error
      }
    },
    enabled: !!debouncedUsername && debouncedUsername.length >= 3,
    retry: false,
    staleTime: 30000, // Cache for 30 seconds
  })

  return {
    isAvailable,
    isLoading: isLoading && debouncedUsername.length >= 3,
    debouncedUsername,
  }
}
