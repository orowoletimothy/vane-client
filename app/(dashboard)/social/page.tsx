"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Search, UserPlus, Users, UserCheck, UserX, MessageCircle } from "lucide-react"
import { inter } from "@/lib/fonts"
import api from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

interface Friend {
    _id: string
    displayName: string
    username: string
    profilePicture: string
    genStreakCount?: number
    longestStreak?: number
    createdAt?: string
}

interface FriendRequest {
    _id: string
    displayName: string
    username: string
    profilePicture: string
    genStreakCount?: number
    longestStreak?: number
}

interface OutgoingRequest {
    _id: string
    displayName: string
    username: string
    profilePicture: string
    genStreakCount?: number
    longestStreak?: number
}

export default function SocialPage() {
    const { user } = useAuthStore()
    const [friends, setFriends] = useState<Friend[]>([])
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
    const [outgoingRequests, setOutgoingRequests] = useState<OutgoingRequest[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Friend[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [friendRequestLoading, setFriendRequestLoading] = useState(false)
    const [friendRequestSent, setFriendRequestSent] = useState(false)
    const [friendProfile, setFriendProfile] = useState<any | null>(null)
    const [friendProfileOpen, setFriendProfileOpen] = useState(false)
    const [friendHabits, setFriendHabits] = useState<any[]>([])
    const [friendProfileLoading, setFriendProfileLoading] = useState(false)
    const [showNoteInput, setShowNoteInput] = useState(false)
    const [noteText, setNoteText] = useState("")

    useEffect(() => {
        if (user) {
            fetchFriends()
            fetchFriendRequests()
            fetchOutgoingRequests()
        }
    }, [user])

    const fetchFriends = async () => {
        try {
            const response = await api.get(`/social/user/${user?._id}/friends`)
            setFriends(response.data)
        } catch (error) {
            console.error("Failed to fetch friends:", error)
        }
    }

    const fetchFriendRequests = async () => {
        try {
            const response = await api.get(`/social/user/${user?._id}/friend-requests`)
            setFriendRequests(response.data)
        } catch (error) {
            console.error("Failed to fetch friend requests:", error)
        }
    }

    const fetchOutgoingRequests = async () => {
        try {
            const response = await api.get(`/social/user/${user?._id}/outgoing-friend-requests`)
            setOutgoingRequests(response.data)
        } catch (error) {
            console.error("Failed to fetch outgoing friend requests:", error)
        }
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        setIsSearching(true)
        try {
            const response = await api.get(`/social/search?query=${searchQuery}`)
            // Filter out the current user from results
            const filtered = response.data.filter((u: any) => u._id !== user?._id)
            setSearchResults(filtered)
        } catch (error) {
            console.error("Search failed:", error)
        } finally {
            setIsSearching(false)
        }
    }

    const handleUserWidgetClick = (user: any) => {
        setSelectedUser(user)
        setDialogOpen(true)
        setFriendRequestSent(false)
    }

    const handleSendFriendRequest = async (friendId: string) => {
        setFriendRequestLoading(true)
        try {
            await api.post(`/social/user/${user?._id}/friend-request`, { friendId })
            setFriendRequestSent(true)
            toast.success("Friend request sent!")
            // Refresh outgoing and incoming requests, and search results
            fetchOutgoingRequests()
            fetchFriendRequests()
            handleSearch()
        } catch (error: any) {
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("Failed to send friend request")
            }
        } finally {
            setFriendRequestLoading(false)
        }
    }

    const acceptFriendRequest = async (requestId: string) => {
        try {
            await api.post(`/social/user/${user?._id}/accept-friend`, { friendId: requestId })
            // Update friend requests and friends lists
            fetchFriendRequests()
            fetchFriends()
        } catch (error) {
            console.error("Failed to accept friend request:", error)
        }
    }

    const rejectFriendRequest = async (requestId: string) => {
        try {
            await api.post(`/social/user/${user?._id}/reject-friend`, { friendId: requestId })
            // Update friend requests list
            fetchFriendRequests()
        } catch (error) {
            console.error("Failed to reject friend request:", error)
        }
    }

    const removeFriend = async (friendId: string) => {
        try {
            await api.delete(`/social/user/${user?._id}/friend`, { data: { friendId } })
            // Update friends list
            fetchFriends()
        } catch (error) {
            console.error("Failed to remove friend:", error)
        }
    }

    const handleCancelFriendRequest = async (friendId: string) => {
        try {
            await api.post(`/social/user/${user?._id}/cancel-friend-request`, { friendId })
            toast.success("Friend request cancelled")
            fetchOutgoingRequests()
            handleSearch()
        } catch (error) {
            toast.error("Failed to cancel friend request")
            console.error("Failed to cancel friend request:", error)
        }
    }

    const handleFriendCardClick = async (friend: Friend) => {
        setFriendProfile(friend)
        setFriendProfileOpen(true)
        setFriendProfileLoading(true)
        try {
            const { data } = await api.get(`/users/habits/${friend._id}/public`)
            setFriendHabits(data)
        } catch (error) {
            toast.error("Failed to fetch friend's public habits")
            setFriendHabits([])
        } finally {
            setFriendProfileLoading(false)
        }
    }

    const handleSendNote = async () => {
        if (!noteText.trim() || !user) return
        try {
            await api.post(`/notifications/${friendProfile._id}/encouragement-note`, {
                senderId: user!._id,
                note: noteText.trim()
            })
            toast.success("Note sent and notification delivered!")
            setShowNoteInput(false)
            setNoteText("")
        } catch (err) {
            toast.error("Failed to send note")
        }
    }

    // Helper to check friend/request status
    const isFriend = (id: string) => friends.some(f => f._id === id)
    const isIncomingRequest = (id: string) => friendRequests.some(r => r._id === id)
    const isOutgoingRequest = (id: string) => outgoingRequests.some(r => r._id === id)

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Please log in</h2>
                    <p className="text-gray-600">You need to be logged in to view your social connections.</p>
                </div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}>
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                        <SidebarTrigger />
                        <h1 className="text-xl font-semibold">Social</h1>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                {/* Search Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Search className="w-5 h-5" />
                            <span>Find Friends</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Search by username or display name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            />
                            <Button onClick={handleSearch} disabled={isSearching}>
                                {isSearching ? "Searching..." : "Search"}
                            </Button>
                        </div>

                        {/* User Search Results Widget */}
                        {searchResults.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.map((result) => {
                                    const friend = isFriend(result._id)
                                    const incoming = isIncomingRequest(result._id)
                                    const outgoing = isOutgoingRequest(result._id)
                                    return (
                                        <div
                                            key={result._id}
                                            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-amber-50 transition"
                                            onClick={() => handleUserWidgetClick(result)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Avatar>
                                                    <AvatarImage src={result.profilePicture} />
                                                    <AvatarFallback>{result.displayName[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{result.displayName}</p>
                                                    <p className="text-sm text-gray-500">@{result.username}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline">🔥 {result.genStreakCount || 0} streak</Badge>
                                                        <Badge variant="outline">🏆 {result.longestStreak || 0} best</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {friend ? (
                                                    <Badge variant="secondary">Already Friends</Badge>
                                                ) : incoming ? (
                                                    <Badge variant="secondary">Requested You</Badge>
                                                ) : outgoing ? (
                                                    <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleCancelFriendRequest(result._id) }}>Cancel Request</Button>
                                                ) : (
                                                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={e => { e.stopPropagation(); handleSendFriendRequest(result._id) }}>Add Friend</Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* User Details Dialog */}
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogContent>
                                {selectedUser && (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={selectedUser.profilePicture} />
                                                    <AvatarFallback>{selectedUser.displayName[0]}</AvatarFallback>
                                                </Avatar>
                                                <span>{selectedUser.displayName}</span>
                                            </DialogTitle>
                                            <DialogDescription>@{selectedUser.username}</DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-2 space-y-2">
                                            <div className="text-sm text-gray-600">Email: {selectedUser.email}</div>
                                            <div className="flex gap-2">
                                                <Badge variant="outline">🔥 {selectedUser.genStreakCount || 0} streak</Badge>
                                                <Badge variant="outline">🏆 {selectedUser.longestStreak || 0} best</Badge>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            {isFriend(selectedUser._id) ? (
                                                <Button disabled variant="secondary">Already Friends</Button>
                                            ) : isIncomingRequest(selectedUser._id) ? (
                                                <Button disabled variant="secondary">Requested You</Button>
                                            ) : isOutgoingRequest(selectedUser._id) ? (
                                                <Button disabled variant="secondary">Request Pending</Button>
                                            ) : friendRequestSent ? (
                                                <Button disabled variant="secondary">Friend Request Sent</Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleSendFriendRequest(selectedUser._id)}
                                                    disabled={friendRequestLoading}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white"
                                                >
                                                    {friendRequestLoading ? (
                                                        <>
                                                            <UserPlus className="w-4 h-4 mr-2" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus className="w-4 h-4 mr-2" />
                                                            Add as Friend
                                                        </>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Friends and Requests Tabs */}
                <Tabs defaultValue="friends" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="friends" className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Friends</span>
                            {friends.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {friends.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="flex items-center space-x-2">
                            <UserCheck className="w-4 h-4" />
                            <span>Requests</span>
                            {friendRequests.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {friendRequests.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex items-center space-x-2">
                            <UserPlus className="w-4 h-4" />
                            <span>Pending Sent</span>
                            {outgoingRequests.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {outgoingRequests.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="friends">
                        <Card>
                            <CardContent className="p-6">
                                {friends.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Friends Yet</h3>
                                        <p className="text-gray-500">Start adding friends to see them here!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {friends.map((friend) => (
                                            <div
                                                key={friend._id}
                                                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-amber-50 transition"
                                                onClick={() => handleFriendCardClick(friend)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarImage src={friend.profilePicture} />
                                                        <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{friend.displayName}</p>
                                                        <p className="text-sm text-gray-500">@{friend.username}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={e => { e.stopPropagation(); removeFriend(friend._id) }}
                                                >
                                                    <UserX className="w-4 h-4 mr-2" />
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        {/* Friend Profile Dialog */}
                        <Dialog open={friendProfileOpen} onOpenChange={setFriendProfileOpen}>
                            <DialogContent>
                                {friendProfile && (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={friendProfile.profilePicture} />
                                                    <AvatarFallback>{friendProfile.displayName[0]}</AvatarFallback>
                                                </Avatar>
                                                <span>{friendProfile.displayName}</span>
                                                <Button size="icon" variant="ghost" className="ml-auto" onClick={() => setShowNoteInput(v => !v)} title="Send encouragement">
                                                    <MessageCircle className="w-5 h-5" />
                                                </Button>
                                            </DialogTitle>
                                            <DialogDescription>@{friendProfile.username}</DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-2 space-y-2">
                                            <div className="text-sm text-gray-600">Joined: {friendProfile.createdAt ? new Date(friendProfile.createdAt).toLocaleDateString() : "Unknown"}</div>
                                            <div className="flex gap-2">
                                                <Badge variant="outline">🔥 {friendProfile.genStreakCount || 0} streak</Badge>
                                                <Badge variant="outline">🏆 {friendProfile.longestStreak || 0} best</Badge>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h4 className="font-semibold mb-2">Public Habits</h4>
                                            {friendProfileLoading ? (
                                                <div>Loading...</div>
                                            ) : friendHabits.length === 0 ? (
                                                <div className="text-gray-500">No public habits</div>
                                            ) : (
                                                <ul className="space-y-2">
                                                    {friendHabits.map(habit => (
                                                        <li key={habit._id} className="p-2 bg-gray-50 rounded flex items-center gap-2">
                                                            <span className="text-lg">{habit.icon}</span>
                                                            <span className="font-medium">{habit.title}</span>
                                                            <span className="ml-auto text-xs text-amber-600">🔥 {habit.streak} day streak</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        {showNoteInput && (
                                            <div className="mt-4 flex gap-2 items-center">
                                                <input
                                                    className="flex-1 border rounded px-2 py-1"
                                                    placeholder="Send a note of encouragement..."
                                                    value={noteText}
                                                    onChange={e => setNoteText(e.target.value)}
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={(user && friendProfile ? handleSendNote : undefined)}
                                                    disabled={!noteText.trim() || !user}
                                                >
                                                    Send
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </DialogContent>
                        </Dialog>
                    </TabsContent>

                    <TabsContent value="requests">
                        <Card>
                            <CardContent className="p-6">
                                {friendRequests.length === 0 ? (
                                    <div className="text-center py-8">
                                        <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                                        <p className="text-gray-500">When someone sends you a friend request, it will appear here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {friendRequests.map((request) => (
                                            <div
                                                key={request._id}
                                                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarImage src={request.profilePicture} />
                                                        <AvatarFallback>{request.displayName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{request.displayName}</p>
                                                        <p className="text-sm text-gray-500">@{request.username}</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => acceptFriendRequest(request._id)}
                                                        className="bg-green-500 hover:bg-green-600"
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => rejectFriendRequest(request._id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pending">
                        <Card>
                            <CardContent className="p-6">
                                {outgoingRequests.length === 0 ? (
                                    <div className="text-center py-8">
                                        <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Sent Requests</h3>
                                        <p className="text-gray-500">Friend requests you send will appear here until accepted or cancelled.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {outgoingRequests.map((request) => (
                                            <div
                                                key={request._id}
                                                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Avatar>
                                                        <AvatarImage src={request.profilePicture} />
                                                        <AvatarFallback>{request.displayName[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{request.displayName}</p>
                                                        <p className="text-sm text-gray-500">@{request.username}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleCancelFriendRequest(request._id)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
} 