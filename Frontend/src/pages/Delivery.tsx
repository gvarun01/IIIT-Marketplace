import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import Cookies from "js-cookie"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { ChatButton } from "@/components/chat/ChatButton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Package, CheckCircle, Truck, Clock, Calendar, User, Box, IndianRupee, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApiError {
  statusCode: number
  message: string
  errors: string[]
  success: boolean
}

interface DeliveryOrder {
  _id: string
  transactionId: string
  buyerId: {
    firstName: string
    lastName: string
  }
  items: Array<{
    itemId: {
      name: string
      price: number
    }
    quantity: number
  }>
  totalAmount: number
  status: string
  createdAt: string
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-16 px-4">
    <Box className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-1">{message}</h3>
    <p className="text-gray-500">Orders will appear here once they are available.</p>
  </div>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="flex items-center gap-2 text-[#99B898]">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Loading orders...</span>
    </div>
  </div>
)

const OtpInput = ({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) => (
  <div className="space-y-2">
    <div className="relative">
      <Input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="000000"
        value={value}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "")
          if (val.length <= 6) onChange(val)
        }}
        className={cn(
          "text-center text-3xl tracking-[0.5em] font-mono h-16 bg-gray-50",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
      />
    </div>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
)

const Delivery = () => {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null)
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const queryClient = useQueryClient()

  useEffect(() => {
    const fetchDeliveryOrders = async () => {
      try {
        const token = Cookies.get("accessToken")
        const userId = Cookies.get("userId")

        const response = await axios.get<{ data: DeliveryOrder[] }>(
          `/api/orders/seller/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        setDeliveryOrders(response.data.data || [])
      } catch (error) {
        const axiosError = error as AxiosError<ApiError>
        const errorMessage = axiosError.response?.data?.message || "Failed to fetch delivery orders"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeliveryOrders()
  }, [])

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ orderId, otp }: { orderId: string; otp: string }) => {
      const token = Cookies.get("accessToken")
      return axios.post(
        "/api/orders/close",
        { orderId, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order delivered successfully",
      })
      setSelectedOrder(null)
      setOtp("")
      setOtpError("")
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] })
      window.location.reload()
    },
    onError: (error: AxiosError<ApiError>) => {
      const errorMessage = error.response?.data?.message || "Failed to verify OTP"
      setOtpError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    },
  })

  const handleVerifyOtp = (orderId: string) => {
    setOtpError("")
    if (!otp) {
      setOtpError("Please enter the OTP")
      return
    }
    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits")
      return
    }
    verifyOtpMutation.mutate({ orderId, otp })
  }

  const pendingOrders = deliveryOrders.filter(order => order.status === "Pending")
  const completedOrders = deliveryOrders.filter(order => order.status === "Completed")

  const renderOrderCard = (order: DeliveryOrder, showDeliverButton: boolean = false) => (
    <Card key={order._id} className="border border-[#E8B4A2]/20 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-4 flex-grow">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-[#2A363B] text-lg">
                  Order #{order.transactionId}
                </h3>
                <Badge 
                  variant={order.status === "Pending" ? "warning" : "success"}
                  className="font-medium"
                >
                  {order.status === "Pending" ? (
                    <Clock className="w-3 h-3 mr-1" />
                  ) : (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-[#4A5859]">
                <User className="w-4 h-4" />
                <p className="text-sm">
                  {order.buyerId?.firstName} {order.buyerId?.lastName}
                </p>
              </div>
            </div>
            
            <Separator className="bg-[#E8B4A2]/20" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#2A363B] font-medium">
                <Box className="w-4 h-4" />
                <p>Order Items</p>
              </div>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-[#4A5859] pl-6">
                  <span>{item.itemId.name} × {item.quantity}</span>
                  <span className="font-medium">₹{(item.itemId.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <Separator className="bg-[#E8B4A2]/20" />
            
            <div className="flex flex-wrap gap-4 justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-[#4A5859]">
                <Calendar className="w-4 h-4" />
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 font-semibold text-[#2A363B]">
                <IndianRupee className="w-4 h-4" />
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {showDeliverButton && (
            <Button
              onClick={() => setSelectedOrder(order)}
              className="bg-[#99B898] hover:bg-[#7a9479] text-white shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2"
              size="lg"
            >
              <Truck className="w-4 h-4" />
              Deliver
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FDF8F3] to-[#F8E5D5]">
      <Navbar isCartAnimating={false} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ChatButton apiKey="AIzaSyA37unXfqTDlSOdi84mtNeYoeDHR2yWNQM" />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#2A363B]">
              Delivery Management
            </h1>
            <p className="text-[#4A5859] mt-2">
              Manage and track your order deliveries
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : deliveryOrders.length > 0 ? (
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#F8E5D5] p-1 rounded-lg">
                <TabsTrigger
                  value="pending"
                  className="data-[state=active]:bg-[#99B898] data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Pending ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-[#99B898] data-[state=active]:text-white rounded-md transition-all duration-300"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed ({completedOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingOrders.length === 0 ? (
                  <EmptyState message="No pending orders" />
                ) : (
                  pendingOrders.map(order => renderOrderCard(order, true))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedOrders.length === 0 ? (
                  <EmptyState message="No completed orders" />
                ) : (
                  completedOrders.map(order => renderOrderCard(order))
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <EmptyState message="No orders found" />
          )}
        </div>

        <Dialog open={!!selectedOrder} onOpenChange={() => {
          setSelectedOrder(null)
          setOtp("")
          setOtpError("")
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Verify Delivery OTP</DialogTitle>
              <DialogDescription>
                Enter the 6-digit OTP provided by the customer to complete the delivery
              </DialogDescription>
            </DialogHeader>
            <div className="p-4">
              <OtpInput
                value={otp}
                onChange={setOtp}
                error={otpError}
              />
              {selectedOrder && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm text-gray-500">Order Details</p>
                  <p className="font-medium">#{selectedOrder.transactionId}</p>
                  <p className="text-sm text-gray-600">
                    Customer: {selectedOrder.buyerId.firstName} {selectedOrder.buyerId.lastName}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => handleVerifyOtp(selectedOrder!._id)}
                disabled={!otp || verifyOtpMutation.isPending}
                className="w-full bg-[#99B898] hover:bg-[#7a9479] text-white h-12 text-lg font-medium shadow-sm hover:shadow-md transition-all duration-300"
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 mr-2" />
                    Complete Delivery
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default Delivery