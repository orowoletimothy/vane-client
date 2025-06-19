"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search, UserPlus, Users, UserCheck, UserX } from "lucide-react";
import { inter } from "@/lib/fonts";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Friend {
  _id: string;
  displayName: string;
  username: string;
  profilePicture: string;
  genStreakCount?: number;
  longestStreak?: number;
}

interface FriendRequest {
  _id: string;
  displayName: string;
  username: string;
  profilePicture: string;
  genStreakCount?: number;
  longestStreak?: number;
}

export default function SocialPage() {
  const { user } = useAuthStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const response = await api.get(`/social/user/${user?._id}/friends`);
      setFriends(response.data);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await api.get(
        `/social/user/${user?._id}/friend-requests`
      );
      setFriendRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch friend requests:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await api.get(`/social/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserWidgetClick = (user: any) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setFriendRequestSent(false);
  };

  const handleSendFriendRequest = async (friendId: string) => {
    setFriendRequestLoading(true);
    try {
      await api.post(`/social/user/${user?._id}/friend-request`, { friendId });
      setFriendRequestSent(true);
      // Optionally update search results or friend requests
    } catch (error) {
      console.error("Failed to send friend request:", error);
    } finally {
      setFriendRequestLoading(false);
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await api.post(`/social/user/${user?._id}/accept-friend`, {
        friendId: requestId,
      });
      // Update friend requests and friends lists
      fetchFriendRequests();
      fetchFriends();
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      await api.post(`/social/user/${user?._id}/reject-friend`, {
        friendId: requestId,
      });
      // Update friend requests list
      fetchFriendRequests();
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      await api.delete(`/social/user/${user?._id}/friend`, {
        data: { friendId },
      });
      // Update friends list
      fetchFriends();
    } catch (error) {
      console.error("Failed to remove friend:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Please log in
          </h2>
          <p className="text-gray-600">
            You need to be logged in to view your social connections.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 ${inter.className}`}
    >
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
                {searchResults.map((result) => (
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
                        <p className="text-sm text-gray-500">
                          @{result.username}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            🔥 {result.genStreakCount || 0} streak
                          </Badge>
                          <Badge variant="outline">
                            🏆 {result.longestStreak || 0} best
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                          <AvatarFallback>
                            {selectedUser.displayName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span>{selectedUser.displayName}</span>
                      </DialogTitle>
                      <DialogDescription>
                        @{selectedUser.username}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 space-y-2">
                      <div className="text-sm text-gray-600">
                        Email: {selectedUser.email}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          🔥 {selectedUser.genStreakCount || 0} streak
                        </Badge>
                        <Badge variant="outline">
                          🏆 {selectedUser.longestStreak || 0} best
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4">
                      {friendRequestSent ? (
                        <Button disabled variant="secondary">
                          Friend Request Sent
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            handleSendFriendRequest(selectedUser._id)
                          }
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="friends"
              className="flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Friends</span>
              {friends.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {friends.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="flex items-center space-x-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Requests</span>
              {friendRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {friendRequests.length}
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Friends Yet
                    </h3>
                    <p className="text-gray-500">
                      Start adding friends to see them here!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {friends.map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={friend.profilePicture} />
                            <AvatarFallback>
                              {friend.displayName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{friend.displayName}</p>
                            <p className="text-sm text-gray-500">
                              @{friend.username}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFriend(friend._id)}
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
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardContent className="p-6">
                {friendRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Pending Requests
                    </h3>
                    <p className="text-gray-500">
                      When someone sends you a friend request, it will appear
                      here.
                    </p>
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
                            <AvatarFallback>
                              {request.displayName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.displayName}</p>
                            <p className="text-sm text-gray-500">
                              @{request.username}
                            </p>
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
        </Tabs>
      </div>
    </div>
  );
}
