import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";

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
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#FDF8F3] mb-4">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
        />
        <button className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-[#99B898] hover:text-white">
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-[#2A363B] group-hover:text-[#99B898] transition-colors">
          {name}
        </h3>
        <p className="text-sm text-[#4A5859]">by {seller}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold text-[#2A363B]">₹{price}</p>
            {salePrice && (
              <p className="text-sm font-medium text-red-500 line-through">
                ₹{salePrice}
              </p>
            )}
          </div>
          <div className="flex items-center text-[#99B898]">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm font-medium">{rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};