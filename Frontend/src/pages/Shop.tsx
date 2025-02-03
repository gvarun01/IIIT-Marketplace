import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/product/ProductCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Filter, SlidersHorizontal } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Item } from "@/types/item";
import axios from "axios";
import { useSearchParams } from 'react-router-dom';
import { ChatButton } from "@/components/chat/ChatButton";

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const Shop = () => {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const searchTerm = searchParams.get('search') || "";

  const categories = [
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Sports & Outdoors",
    "Toys & Games",
    "Health & Beauty",
    "Automotive",
    "Other",
  ];

  const fetchItems = useCallback(
    async (page: number) => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/items', {
          params: {
            ...(searchTerm && { name: searchTerm }),
            ...(category && category !== "all" && { category }),
            ...(sortBy && sortBy !== "default" && {
              sort: sortBy === "price-low" 
                ? "price" 
                : sortBy === "price-high" 
                ? "-price" 
                : "-averageRating"
            }),
            page: page,
            limit: 5
          }
        });
        
        setItems(response.data.data);
        setPagination({
          currentPage: page,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
        });
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [category, sortBy, searchTerm]
  );

  useEffect(() => {
    fetchItems(1);
  }, [category, sortBy, fetchItems]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on category change
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    fetchItems(page);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
      <Navbar isCartAnimating={false} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ChatButton apiKey="AIzaSyA37unXfqTDlSOdi84mtNeYoeDHR2yWNQM"/>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-[#2A363B]">Browse Items</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select onValueChange={handleCategoryChange} value={category}>
              <SelectTrigger className="w-[180px] bg-white border-[#E8B4A2]/20 text-[#2A363B]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSortBy} value={sortBy}>
              <SelectTrigger className="w-[180px] bg-white border-[#E8B4A2]/20 text-[#2A363B]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <ProductCard
              key={item._id}
              id={item._id}
              name={item.name}
              price={item.price}
              image={item.images[0]}
              seller={`${item.sellerId.firstName} ${item.sellerId.lastName}`}
              rating={item.averageRating}
            />
          ))}
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    className={`hover:bg-[#F8E5D5] cursor-pointer ${
                      pagination.currentPage <= 1
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  />
                </PaginationItem>

                {Array.from({ length: pagination.totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(i + 1)}
                      className={`cursor-pointer ${
                        pagination.currentPage === i + 1
                          ? "bg-[#99B898] text-white hover:bg-[#7a9479]"
                          : "hover:bg-[#F8E5D5]"
                      }`}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    className={`hover:bg-[#F8E5D5] cursor-pointer ${
                      pagination.currentPage >= pagination.totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
