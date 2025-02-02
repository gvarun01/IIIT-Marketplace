import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "../products/ProductCard";

// This will be replaced with actual API call later
const fetchNewArrivals = async () => {
  return [
    {
      id: "1",
      name: "Black T-Shirt",
      price: 35,
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
      seller: "Fashion Hub",
      rating: 4,
    },
    {
      id: "2",
      name: "Skinny Fit Jeans",
      price: 240,
      salePrice: 250,
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
      seller: "Denim Co",
      rating: 5,
    },
  ];
};

export const NewArrivals = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["newArrivals"],
    queryFn: fetchNewArrivals,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">NEW ARRIVALS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products?.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};