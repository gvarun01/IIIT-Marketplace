import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, Star, Store } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";


const addToCart = async (itemId: string, quantity: number) => {
  const token = Cookies.get("accessToken")
  const response = await axios.post(
    "/api/cart",
    { itemId, quantity },
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}

interface ProductInfoProps {
  __id: string
  name: string
  price: number
  description: string
  seller: {
    _id: string
    firstName: string
    lastName: string
  }
  rating: number
  onAddToCart: () => void // New prop for cart animation
}

const truncateText = (text: string, maxLength = 600) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + " ........."
}

export const ProductInfo = ({
  __id,
  name,
  price,
  description,
  seller,
  rating,
  onAddToCart, // New prop
}: ProductInfoProps) => {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const queryClient = useQueryClient()

  const addToCartMutation = useMutation({
    mutationFn: () => addToCart(__id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
      toast({
        title: "Success!",
        description: `${quantity} ${quantity === 1 ? "item" : "items"} added to your cart`,
      })
      onAddToCart() // Trigger cart animation
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      })
    },
  })

  const handleAddToCart = () => {
    setIsAdding(true)
    addToCartMutation.mutate()
    setTimeout(() => setIsAdding(false), 1000)
  }

  return (
    <div className="h-full flex flex-col justify-between space-y-8 p-6 bg-white rounded-xl shadow-sm">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#2A363B] animate-in fade-in slide-in-from-top duration-500">
            {name}
          </h1>
          <Link 
            to={`/seller/${seller._id}`}
            className="flex items-center gap-2 text-gray-600 hover:text-[#99B898] transition-colors group"
          >
            <Store className="h-4 w-4" />
            <p>Sold by {`${seller.firstName} ${seller.lastName}`}</p>
            <span className="text-sm text-[#99B898] group-hover:underline">View Profile →</span>
          </Link>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-3xl font-bold text-[#99B898]">₹{price.toLocaleString()}</p>
          <p className="text-gray-600 leading-relaxed">{truncateText(description)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-3 hover:bg-gray-100 transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-6 py-2 font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-3 hover:bg-gray-100 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`flex-1 h-12 text-lg transition-all duration-300 ${
              isAdding
                ? "bg-[#99B898] hover:bg-[#7a9479] scale-105"
                : "bg-[#2A363B] hover:bg-[#435055]"
            }`}
          >
            <ShoppingCart className={`mr-2 h-5 w-5 ${isAdding ? "animate-bounce" : ""}`} />
            {isAdding ? "Added to Cart!" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );


  // ... rest of the component remains the same
}

