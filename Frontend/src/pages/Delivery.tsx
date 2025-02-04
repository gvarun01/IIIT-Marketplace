import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ChatButton } from "@/components/chat/ChatButton";

interface DeliveryOrder {
  _id: string;
  transactionId: string;
  buyerId: {
    firstName: string;
    lastName: string;
  };
  items: Array<{
    itemId: {
      name: string;
      price: number;

    };
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const Delivery = () => {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchDeliveryOrders = async () => {
      try {
        const token = Cookies.get("accessToken");
        const userId = Cookies.get("userId"); // Add this line to get userId

        const response = await axios.get<{ data: DeliveryOrder[] }>(
          "/api/orders/buyer/${userId}",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // console.log(response.data.data);
        setDeliveryOrders(response.data.data || []);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Failed to fetch delivery orders",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryOrders();
  }, []);

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ orderId, otp }: { orderId: string; otp: string }) => {
      const token = Cookies.get("accessToken");
      return axios.post(
        "/api/orders/close",
        { orderId, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order delivered successfully",
      });
      setSelectedOrder(null);
      setOtp("");
      queryClient.invalidateQueries({ queryKey: ["deliveryOrders"] });
      // Refresh the orders list
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        variant: "destructive",
      });
    },
  });

  const handleVerifyOtp = (orderId: string) => {
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter OTP",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate({ orderId, otp });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
      <Navbar isCartAnimating={false} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ChatButton apiKey="AIzaSyA37unXfqTDlSOdi84mtNeYoeDHR2yWNQM" />
        <h1 className="text-3xl font-bold mb-8 text-[#2A363B]">
          Delivery Queue
        </h1>
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin">Loading...</div>
          </div>
        ) : deliveryOrders.length > 0 ? (
          <div className="grid gap-6">
            {deliveryOrders.map((order) => (
              console.log(order),
              <Card key={order._id} className="border border-[#E8B4A2]/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-[#2A363B]">
                        Order #{order.transactionId}
                      </h3>
                      <p className="text-sm text-[#4A5859]">
                        Buyer: {order.buyerId.firstName} {order.buyerId.lastName}
                      </p>
                      <p className="text-sm text-[#4A5859]">
                        Amount: ₹{order.totalAmount}
                      </p>
                      <div className="mt-2 space-y-1">
                        {order.items.map((item, index) => (
                          console.log("Items are ",item),
                          <p key={index} className="text-sm text-[#4A5859]">
                            {item.itemId.name} × {item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedOrder(order._id)}
                      className="bg-[#99B898] hover:bg-[#7a9479] text-white"
                    >
                      Deliver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#4A5859]">No orders to deliver</div>
        )}

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Delivery OTP</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-wider"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={() => handleVerifyOtp(selectedOrder!)}
                disabled={!otp || verifyOtpMutation.isPending}
                className="bg-[#99B898] hover:bg-[#7a9479] text-white"
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Deliver"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Delivery;