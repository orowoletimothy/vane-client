"use client"

import type * as React from "react"
import { BarChart3, Home, Settings, User, Target, TrendingUp, Users, LogOut } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/auth-store"
import { NotificationBell } from "@/components/notification-bell"
import api from "@/lib/api"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Habits",
    url: "/habits",
    icon: Target,
  },
  {
    title: "Social",
    url: "/social",
    icon: Users,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: BarChart3,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

const accountItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      // Even if the server request fails, redirect to login
      router.push("/login")
    }
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Vane</h2>
              <p className="text-sm text-gray-600">Habit Tracker</p>
            </div>
          </div>
          {user && <NotificationBell />}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <button className="w-full" onClick={() => router.push(item.url)}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} onClick={() => router.push(item.url)}>
                    <button className="w-full">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button className="w-full text-red-500 hover:text-red-600" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">
                      {(user.displayName || user.username)?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{user.displayName || user.username}</span>
                </div>
                <div className="text-xs text-gray-600">
                  <p>Current Streak: {user.current_streak} days</p>
                  <p>Recovery Points: {user.recovery_points}</p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
