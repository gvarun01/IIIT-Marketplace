import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductReviews } from "@/components/product/ProductReviews";
import { Item } from "@/types/item";
import axios from "axios";
import { ChatButton } from "@/components/chat/ChatButton";
import { Loader2 } from "lucide-react";

const fetchProduct = async (id: string): Promise<Item> => {
  const response = await axios.get(`/api/items/${id}`);
  console.log("Product data:", response.data.data);
  return response.data.data;
};

const Product = () => {
  const { id } = useParams();
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id!),
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-[#99B898]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="font-medium">Loading product...</span>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#2A363B]">Product Not Found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <ChatButton apiKey="AIzaSyA37unXfqTDlSOdi84mtNeYoeDHR2yWNQM" />
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <ProductGallery images={product.images} />
          </div>

          <ProductInfo
            __id={product._id}
            name={product.name}
            price={product.price}
            description={product.description}
            seller={{
              _id: product.sellerId._id,
              firstName: product.sellerId.firstName,
              lastName: product.sellerId.lastName,
            }}
            rating={product.averageRating}
          />
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-[#2A363B] mb-6">Product Details</h2>
          <p className="text-gray-600 leading-relaxed">{product.description}</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm">
        <ProductReviews 
            productId={product._id}
            reviews={product.reviews}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Product;