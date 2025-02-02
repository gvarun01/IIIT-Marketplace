import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  seller: string;
  rating: number;
}

export const ProductCard = ({ id, name, price, salePrice, image, seller, rating }: ProductCardProps) => {
  return (
    <Link to={`/product/${id}`} className="group">
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <h3 className="text-sm font-medium text-gray-900">{name}</h3>
      <p className="text-sm text-gray-500">Sold by {seller}</p>
      <div className="flex items-center space-x-2 mt-1">
        <p className="text-sm font-medium text-gray-900">${price}</p>
        {salePrice && (
          <p className="text-sm font-medium text-red-500 line-through">
            ${salePrice}
          </p>
        )}
      </div>
      <div className="flex items-center mt-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    </Link>
  );
};