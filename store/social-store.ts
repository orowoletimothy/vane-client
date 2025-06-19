import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Friend {
    id: string
    username: string
    display_name?: string
    profilePicture?: string
    current_streak: number
    is_online: boolean
    last_seen?: string
    mutual_friends: number
}

export interface FriendRequest {
    id: string
    from_user_id: string
    to_user_id: string
    from_user: {
        username: string
        display_name?: string
        profilePicture?: string
    }
    status: "pending" | "accepted" | "declined"
    created_at: string
}

export interface SocialActivity {
    id: string
    user_id: string
    user: {
        username: string
        display_name?: string
        profilePicture?: string
    }
    type: "streak_milestone" | "habit_completed" | "new_habit" | "achievement"
    content: string
    habit_title?: string
    streak_count?: number
    created_at: string
    likes: number
    comments: number
    is_liked: boolean
}

export interface LeaderboardEntry {
    user_id: string
    username: string
    display_name?: string
    profilePicture?: string
    current_streak: number
    total_habits: number
    completion_rate: number
    rank: number
}

interface SocialState {
    friends: Friend[]
    friendRequests: FriendRequest[]
    activities: SocialActivity[]
    leaderboard: LeaderboardEntry[]

    // Actions
    addFriend: (userId: string) => void
    removeFriend: (userId: string) => void
    sendFriendRequest: (username: string) => Promise<boolean>
    acceptFriendRequest: (requestId: string) => void
    declineFriendRequest: (requestId: string) => void
    likeActivity: (activityId: string) => void
    addActivity: (activity: Omit<SocialActivity, "id" | "created_at" | "likes" | "comments" | "is_liked">) => void
    loadMockData: () => void
}

export const useSocialStore = create<SocialState>()(
    persist(
        (set, get) => ({
            friends: [],
            friendRequests: [],
            activities: [],
            leaderboard: [],

            addFriend: (userId) => {
                // In real app, this would make an API call
                console.log("Adding friend:", userId)
            },

            removeFriend: (userId) => {
                set((state) => ({
                    friends: state.friends.filter((friend) => friend.id !== userId),
                }))
            },

            sendFriendRequest: async (username) => {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1000))

                // Mock success/failure
                const success = Math.random() > 0.3 // 70% success rate

                if (success) {
                    const mockRequest: FriendRequest = {
                        id: crypto.randomUUID(),
                        from_user_id: "current-user-id",
                        to_user_id: crypto.randomUUID(),
                        from_user: {
                            username: "you",
                            display_name: "You",
                        },
                        status: "pending",
                        created_at: new Date().toISOString(),
                    }

                    set((state) => ({
                        friendRequests: [...state.friendRequests, mockRequest],
                    }))
                }

                return success
            },

            acceptFriendRequest: (requestId) => {
                set((state) => {
                    const request = state.friendRequests.find((req) => req.id === requestId)
                    if (!request) return state

                    const newFriend: Friend = {
                        id: request.from_user_id,
                        username: request.from_user.username,
                        display_name: request.from_user.display_name,
                        profilePicture: request.from_user.profilePicture,
                        current_streak: Math.floor(Math.random() * 50),
                        is_online: Math.random() > 0.5,
                        mutual_friends: Math.floor(Math.random() * 10),
                    }

                    return {
                        friends: [...state.friends, newFriend],
                        friendRequests: state.friendRequests.filter((req) => req.id !== requestId),
                    }
                })
            },

            declineFriendRequest: (requestId) => {
                set((state) => ({
                    friendRequests: state.friendRequests.filter((req) => req.id !== requestId),
                }))
            },

            likeActivity: (activityId) => {
                set((state) => ({
                    activities: state.activities.map((activity) =>
                        activity.id === activityId
                            ? {
                                ...activity,
                                is_liked: !activity.is_liked,
                                likes: activity.is_liked ? activity.likes - 1 : activity.likes + 1,
                            }
                            : activity,
                    ),
                }))
            },

            addActivity: (activityData) => {
                const newActivity: SocialActivity = {
                    ...activityData,
                    id: crypto.randomUUID(),
                    created_at: new Date().toISOString(),
                    likes: 0,
                    comments: 0,
                    is_liked: false,
                }

                set((state) => ({
                    activities: [newActivity, ...state.activities],
                }))
            },

            loadMockData: () => {
                const mockFriends: Friend[] = [
                    {
                        id: "1",
                        username: "alice_runner",
                        display_name: "Alice Johnson",
                        profilePicture: "/placeholder.svg?height=40&width=40",
                        current_streak: 23,
                        is_online: true,
                        mutual_friends: 5,
                    },
                    {
                        id: "2",
                        username: "bob_reader",
                        display_name: "Bob Smith",
                        profilePicture: "/placeholder.svg?height=40&width=40",
                        current_streak: 15,
                        is_online: false,
                        last_seen: "2 hours ago",
                        mutual_friends: 3,
                    },
                    {
                        id: "3",
                        username: "carol_meditator",
                        display_name: "Carol Davis",
                        profilePicture: "/placeholder.svg?height=40&width=40",
                        current_streak: 45,
                        is_online: true,
                        mutual_friends: 8,
                    },
                ]

                const mockRequests: FriendRequest[] = [
                    {
                        id: "req1",
                        from_user_id: "4",
                        to_user_id: "current-user",
                        from_user: {
                            username: "david_writer",
                            display_name: "David Wilson",
                            profilePicture: "/placeholder.svg?height=40&width=40",
                        },
                        status: "pending",
                        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    },
                ]

                const mockActivities: SocialActivity[] = [
                    {
                        id: "act1",
                        user_id: "1",
                        user: {
                            username: "alice_runner",
                            display_name: "Alice Johnson",
                            profilePicture: "/placeholder.svg?height=40&width=40",
                        },
                        type: "streak_milestone",
                        content: "reached a 25-day streak!",
                        streak_count: 25,
                        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                        likes: 12,
                        comments: 3,
                        is_liked: false,
                    },
                    {
                        id: "act2",
                        user_id: "2",
                        user: {
                            username: "bob_reader",
                            display_name: "Bob Smith",
                            profilePicture: "/placeholder.svg?height=40&width=40",
                        },
                        type: "habit_completed",
                        content: "completed their daily reading goal",
                        habit_title: "Read for 30 minutes",
                        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        likes: 8,
                        comments: 1,
                        is_liked: true,
                    },
                    {
                        id: "act3",
                        user_id: "3",
                        user: {
                            username: "carol_meditator",
                            display_name: "Carol Davis",
                            profilePicture: "/placeholder.svg?height=40&width=40",
                        },
                        type: "new_habit",
                        content: "started a new habit",
                        habit_title: "Morning Yoga",
                        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                        likes: 15,
                        comments: 5,
                        is_liked: false,
                    },
                ]

                const mockLeaderboard: LeaderboardEntry[] = [
                    {
                        user_id: "3",
                        username: "carol_meditator",
                        display_name: "Carol Davis",
                        profilePicture: "/placeholder.svg?height=40&width=40",
                        current_streak: 45,
                        total_habits: 8,
                        completion_rate: 92,
                        rank: 1,
                    },
                    {
                        user_id: "current-user",
                        username: "you",
                        display_name: "You",
                        current_streak: 12,
                        total_habits: 5,
                        completion_rate: 85,
                        rank: 2,
                    },
                    {
                        user_id: "1",
                        username: "alice_runner",
                        display_name: "Alice Johnson",
                        profilePicture: "/placeholder.svg?height=40&width=40",
                        current_streak: 23,
                        total_habits: 6,
                        completion_rate: 78,
                        rank: 3,
                    },
                ]

                set({
                    friends: mockFriends,
                    friendRequests: mockRequests,
                    activities: mockActivities,
                    leaderboard: mockLeaderboard,
                })
            },
        }),
        {
            name: "social-storage",
        },
    ),
)
