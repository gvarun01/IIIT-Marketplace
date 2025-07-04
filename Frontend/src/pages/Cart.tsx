import { useState } from "react";
import { Button } from "@/components/ui/button";
// Removed Input from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartItem } from "@/components/cart/cartItem";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChatButton } from "@/components/chat/ChatButton";

interface OrderResponse {
  order: {
    transactionId: string;
    totalAmount: number;
  };
  otp: string;
}

interface CartItem {
  _id: string;
  itemId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
    category: string;
  };
  quantity: number;
}

interface CartResponse {
  _id: string;
  cart: CartItem[];
}

const saveOTP = (transactionId: string, otp: string) => {
  const otps = JSON.parse(localStorage.getItem("orderOTPs") || "{}");
  otps[transactionId] = otp;
  localStorage.setItem("orderOTPs", JSON.stringify(otps));
};

// Removed unused getOTP function:
// const getOTP = (transactionId: string): string | null => {
//   const otps = JSON.parse(localStorage.getItem("orderOTPs") || "{}");
//   return otps[transactionId] || null;
// };

const fetchCart = async () => {
  const token = Cookies.get("accessToken");
  const response = await axios.get<{ data: CartResponse }>("/api/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};

const placeOrder = async (
  items: { itemId: string; quantity: number }[],
  totalAmount: number
) => {
  const token = Cookies.get("accessToken");
  const response = await axios.post<{ data: OrderResponse }>(
    "/api/orders",
    { items, totalAmount },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const updateCartQuantity = async (itemId: string, quantity: number) => {
  console.log(itemId, quantity);
  const token = Cookies.get("accessToken");
  return axios.put(
    `/api/cart/${itemId}`,
    { itemId, quantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

const removeFromCart = async (itemId: string) => {
  const token = Cookies.get("accessToken");
  return axios.delete(`/api/cart/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const clearCart = async () => {
  const token = Cookies.get("accessToken");
  return axios.delete("/api/cart", {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const Cart = () => {
  // Removed unused isLoading from useQuery (was not used for UI changes)
  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

  const subtotal =
    cartData?.cart.reduce(
      (sum, item) => sum + item.itemId.price * item.quantity,
      0
    ) ?? 0;

  const discount = subtotal * 0;
  const total = subtotal - discount;
  const queryClient = useQueryClient();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderResponse | null>(null);

  const placeOrderMutation = useMutation({
    mutationFn: () =>
      placeOrder(
        cartData?.cart.map((item) => ({
          itemId: item.itemId._id,
          quantity: item.quantity,
        })) || [],
        total
      ),
    onSuccess: (data) => {
      // Save OTP to localStorage
      saveOTP(data.order.transactionId, data.otp);
      setOrderDetails(data);
      setShowOtpModal(true);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleCheckout = () => {
    placeOrderMutation.mutate();
    clearCartMutation.mutate();
  };

  // Add mutations
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartQuantity(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const clearCartMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  // Add handlers
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    // console.log(itemId, quantity);
    updateQuantityMutation.mutate({ itemId, quantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeItemMutation.mutate(itemId);
  };

  const handleClearCart = () => {
    clearCartMutation.mutate();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ChatButton apiKey="AIzaSyA37unXfqTDlSOdi84mtNeYoeDHR2yWNQM" />
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">YOUR CART</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {cartData?.cart.map((item) => (
                <CartItem
                  key={item._id}
                  id={item.itemId._id}
                  name={item.itemId.name}
                  price={item.itemId.price}
                  image={item.itemId.images[0]}
                  quantity={item.quantity}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Discount (0%)</span>
                    <span>-₹{discount}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-3 border-t">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleClearCart}
                  >
                    Clear Cart
                  </Button>
                  <Button
                    className="w-full bg-black hover:bg-gray-800"
                    onClick={handleCheckout}
                    disabled={placeOrderMutation.isPending}
                  >
                    {placeOrderMutation.isPending
                      ? "Processing..."
                      : "Place Order →"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Order Placed Successfully!</DialogTitle>
              <DialogDescription>
                <div className="space-y-4">
                  <div>Transaction ID: {orderDetails?.order.transactionId}</div>
                  <div>
                    <span className="font-bold">
                      Your OTP for delivery verification:
                    </span>
                    <div className="text-2xl font-mono mt-2">
                      {orderDetails?.otp}
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Please save this OTP. You'll need to share it with the
                      seller at delivery.
                    </div>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setShowOtpModal(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};
export default Cart;
