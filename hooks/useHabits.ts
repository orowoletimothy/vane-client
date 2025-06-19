import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

// Fetch all habits for a user
export function useHabits(userId: string) {
    return useQuery({
        queryKey: ["habits", userId],
        queryFn: async () => {
            const { data } = await api.get(`/users/habits/${userId}/today`);
            // Transform backend data to match frontend expected structure
            return data.map((habit: any) => {
                // Calculate completedToday based on status and target_count
                const completedToday = habit.status === "complete" ? habit.target_count : 0;
                
                return {
                    id: habit._id,
                    user_id: habit.userId,
                    title: habit.title,
                    reminder_time: habit.reminderTime,
                    status: habit.status,
                    is_public: habit.is_public,
                    target_count: habit.target_count,
                    created_at: habit.createdAt,
                    updated_at: habit.updatedAt,
                    streak: habit.habitStreak,
                    habit_days: habit.repeatDays,
                    last_completed: habit.lastCompleted,
                    notes: habit.notes,
                    icon: habit.icon,
                    completedToday: completedToday
                };
            });
        },
        enabled: !!userId,
    });
}

// Fetch all habits for a user
export function useAllHabits(userId: string) {
    return useQuery({
        queryKey: ["allHabits", userId],
        queryFn: async () => {
            const { data } = await api.get(`/users/habits/${userId}/all`);
            return data.map((habit: any) => ({
                id: habit._id,
                user_id: habit.userId,
                title: habit.title,
                reminder_time: habit.reminderTime,
                status: habit.status,
                is_public: habit.is_public,
                target_count: habit.target_count,
                created_at: habit.createdAt,
                updated_at: habit.updatedAt,
                streak: habit.habitStreak,
                habit_days: habit.repeatDays,
                last_completed: habit.lastCompleted,
                notes: habit.notes,
                icon: habit.icon,
                completedToday: habit.status === "complete" ? habit.target_count : 0
            }));
        },
        enabled: !!userId,
    });
}

// Create a habit
export function useCreateHabit(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (habit: any) => {
            const { data } = await api.post(`/users/habits/${userId}`, {
                title: habit.title,
                icon: habit.icon,
                target_count: habit.target_count,
                repeatDays: habit.habit_days,
                is_public: habit.isPublic,
                reminderTime: habit.reminderTime,
                notes: habit.notes,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["habits", userId] });
        },
    });
}

// Update a habit
export function useUpdateHabit(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ habitId, updates }: { habitId: string; updates: any }) => {
            // Remove status if present in updates
            const { status, habit_days, reminder_time, ...rest } = updates;
            
            // Map client-side field names to server-side field names
            const { data } = await api.put(`/users/habits/${userId}/${habitId}`, {
                ...rest,
                repeatDays: habit_days,
                reminderTime: reminder_time
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["habits", userId] });
        },
    });
}

// Delete a habit
export function useDeleteHabit(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (habitId: string) => {
            await api.delete(`/users/habits/${userId}/${habitId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["habits", userId] });
        },
    });
}

// Set habit status (complete, incomplete, paused)
export function useSetHabitStatus(userId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ habitId, status }: { habitId: string; status: "complete" | "incomplete" | "paused" }) => {
            const { data } = await api.put(`/users/habits/${userId}/${habitId}/status`, { status });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["habits", userId] });
        },
    });
}
