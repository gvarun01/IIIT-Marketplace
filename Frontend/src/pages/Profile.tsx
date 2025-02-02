import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, List, Mail, Phone, Calendar } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { toast } from "@/hooks/use-toast"
import axios from "axios"
import Cookies from "js-cookie"
import type { User } from "@/types/user"
import type { Order } from "@/types/order"
import { ChatButton } from "@/components/chat/ChatButton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const getOTP = (transactionId: string): string | null => {
  const otps = JSON.parse(localStorage.getItem("orderOTPs") || "{}")
  return otps[transactionId] || null
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null)
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([])
  const [sellerOrders, setSellerOrders] = useState<Order[]>([])
  const [isBuyerOrdersLoading, setIsBuyerOrdersLoading] = useState(false)
  const [isSellerOrdersLoading, setIsSellerOrdersLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [tempUser, setTempUser] = useState<User | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = Cookies.get("accessToken")
        const response = await axios.get("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUser(response.data.data)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to fetch user data",
          variant: "destructive",
        })
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    setTempUser(user)
  }, [user])

  useEffect(() => {
    const fetchBuyerOrders = async () => {
      if (!user?._id) return
      setIsBuyerOrdersLoading(true)
      try {
        const token = Cookies.get("accessToken")
        const response = await axios.get(`/api/orders/buyer/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setBuyerOrders(response.data.data || [])
      } catch (error) {
        console.error("Error fetching buyer orders:", error)
        setBuyerOrders([])
        toast({
          title: "Error",
          description: "Failed to fetch your purchase history",
          variant: "destructive",
        })
      } finally {
        setIsBuyerOrdersLoading(false)
      }
    }

    const fetchSellerOrders = async () => {
      if (!user?._id) return
      setIsSellerOrdersLoading(true)
      try {
        const token = Cookies.get("accessToken")
        const response = await axios.get(`/api/orders/seller/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setSellerOrders(response.data.data || [])
      } catch (error) {
        console.error("Error fetching seller orders:", error)
        setSellerOrders([])
        toast({
          title: "Error",
          description: "Failed to fetch your sales history",
          variant: "destructive",
        })
      } finally {
        setIsSellerOrdersLoading(false)
      }
    }

    fetchBuyerOrders()
    fetchSellerOrders()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setTempUser((prev) => (prev ? { ...prev, [id]: value } : null))
  }

  const handleSaveProfile = async () => {
    try {
      const token = Cookies.get("accessToken")
      await axios.put(
        "/api/users/me",
        {
          firstName: tempUser?.firstName,
          lastName: tempUser?.lastName,
          email: tempUser?.email,
          contactNumber: tempUser?.contactNumber,
          age: tempUser?.age,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setUser(tempUser)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      const token = Cookies.get("accessToken")
      await axios.put(
        "/api/users/update-password",
        { currentPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      toast({
        title: "Success",
        description: "Password changed successfully",
      })
      setIsChangePasswordOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Navbar isCartAnimating={false} />
      <main className="flex-grow">
        <ChatButton apiKey="AIzaSyA37unXfqTDlSOdi84mtNeYoeDHR2yWNQM" />
        <div className="min-h-screen bg-[#FDF8F3] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="shadow-lg border border-[#E8B4A2]/20">
              <CardHeader className="space-y-1">
                <CardTitle className="text-3xl font-bold tracking-tight text-center text-[#2A363B]">Profile</CardTitle>
                <CardDescription className="text-center">Manage your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={tempUser?.firstName ?? ""}
                        readOnly={!isEditing}
                        onChange={handleChange}
                        className="bg-white border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={tempUser?.lastName ?? ""}
                        readOnly={!isEditing}
                        onChange={handleChange}
                        className="bg-white border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          value={tempUser?.email ?? ""}
                          readOnly={true}
                          className="bg-white pl-10 border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4A5859]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact</Label>
                      <div className="relative">
                        <Input
                          id="contactNumber"
                          value={tempUser?.contactNumber ?? ""}
                          readOnly={!isEditing}
                          onChange={handleChange}
                          className="bg-white pl-10 border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                        />
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4A5859]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <div className="relative">
                        <Input
                          id="age"
                          type="number"
                          value={tempUser?.age ?? ""}
                          readOnly={!isEditing}
                          onChange={handleChange}
                          className="bg-white pl-10 border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898]"
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#4A5859]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-[#E8B4A2] hover:bg-[#d6a292] text-white">
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                            <Input
                              id="confirmNewPassword"
                              type="password"
                              value={confirmNewPassword}
                              onChange={(e) => setConfirmNewPassword(e.target.value)}
                            />
                          </div>
                        </div>
                        <Button onClick={handleChangePassword}>Change Password</Button>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                      className="w-full sm:w-auto bg-[#99B898] hover:bg-[#7a9479] text-white"
                    >
                      {isEditing ? "Save Profile" : "Update Profile"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border border-[#E8B4A2]/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight text-[#2A363B]">Order History</CardTitle>
                <CardDescription>View your buying and selling history</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="buying" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[#F8E5D5]">
                    <TabsTrigger
                      value="buying"
                      className="data-[state=active]:bg-[#99B898] data-[state=active]:text-white"
                    >
                      Buying History
                    </TabsTrigger>
                    <TabsTrigger
                      value="selling"
                      className="data-[state=active]:bg-[#99B898] data-[state=active]:text-white"
                    >
                      Selling History
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="buying">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-[#99B898]" />
                        <h3 className="text-lg font-medium text-[#2A363B]">Purchase History</h3>
                      </div>
                      <Separator className="bg-[#E8B4A2]/20" />
                      {isBuyerOrdersLoading ? (
                        <div className="text-center py-4">Loading purchase history...</div>
                      ) : buyerOrders.length === 0 ? (
                        <div className="text-center py-4">No purchase history available.</div>
                      ) : (
                        <div className="space-y-4">
                          {buyerOrders.map((order) => (
                            <Card key={order._id} className="border border-[#E8B4A2]/20">
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-semibold text-[#2A363B]">
                                        Transaction ID: {order.transactionId}
                                      </p>
                                      <p className="text-sm text-[#4A5859]">
                                        Ordered on {new Date(order.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div
                                      className={`px-2 py-1 rounded-full text-sm ${
                                        order.status === "Pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : order.status === "Completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {order.status}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    {order.items.map((item) => (
                                      <div key={item._id} className="flex justify-between text-sm">
                                        <div className="flex-1">
                                          <p className="text-[#2A363B]">{item.itemId.name}</p>
                                          <p className="text-[#4A5859] text-xs">
                                            Sold by: {item.itemId.sellerId.firstName} {item.itemId.sellerId.lastName}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[#2A363B]">₹{item.itemId.price * item.quantity}</p>
                                          <p className="text-[#4A5859] text-xs">Qty: {item.quantity}</p>
                                        </div>
                                      </div>
                                    ))}

                                    {order.status === "Pending" && getOTP(order.transactionId) && (
                                      <div className="mt-4 p-3 bg-gray-50 rounded-md">
                                        <p className="text-sm font-medium text-gray-700">Delivery OTP</p>
                                        <p className="text-xl font-mono mt-1">{getOTP(order.transactionId)}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Share this OTP with the seller at delivery
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <Separator className="bg-[#E8B4A2]/20" />

                                  <div className="flex justify-between font-semibold">
                                    <span>Total Amount</span>
                                    <span>₹{order.totalAmount}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="selling">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <List className="h-5 w-5 text-[#99B898]" />
                        <h3 className="text-lg font-medium text-[#2A363B]">Sales History</h3>
                      </div>
                      <Separator className="bg-[#E8B4A2]/20" />
                      {isSellerOrdersLoading ? (
                        <div className="text-center py-4">Loading sales history...</div>
                      ) : sellerOrders.length === 0 ? (
                        <div className="text-center py-4">No sales history available.</div>
                      ) : (
                        <div className="space-y-4">
                          {sellerOrders.map((order) => (
                            <Card key={order.transactionId} className="border border-[#E8B4A2]/20">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-semibold text-[#2A363B]">
                                      Transaction ID: {order.transactionId}
                                    </p>
                                    <p className="text-sm text-[#4A5859]">
                                      Items: {order.items.map((item) => item.itemId.name).join(", ")}
                                    </p>
                                    <p className="text-sm text-[#4A5859]">
                                      Purchased on {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-[#4A5859]">Status: {order.status}</p>
                                  </div>
                                  <p className="font-bold text-[#2A363B]">₹{order.totalAmount.toFixed(2)}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Profile

