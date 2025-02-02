import { Minus, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
interface CartItemProps {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}
export const CartItem = ({
  id,
  name,
  price,
  quantity,
  image,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) => {
  return (
    <div className="flex items-center gap-4 py-4 border-b">
      <img src={image} alt={name} className="w-24 h-24 object-cover rounded-lg" />
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{name}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600"
            onClick={() => onRemove(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(id, Math.max(0, quantity - 1))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="font-medium">${price}</p>
        </div>
      </div>
    </div>
  )
}
