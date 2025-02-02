import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "../products/ProductCard";

// This will be replaced with actual API call later
const fetchTopSelling = async () => {
  return [
    {
      id: "3",
      name: "Casual Shirt",
      price: 45,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
      seller: "Fashion Store",
      rating: 4,
    },
    {
      id: "4",
      name: "Orange T-Shirt",
      price: 35,
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
      seller: "Trendy Wear",
      rating: 5,
    },
  ];
};

export const TopSelling = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["topSelling"],
    queryFn: fetchTopSelling,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">TOP SELLING</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};