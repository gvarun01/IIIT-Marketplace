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
    "Home & Garden", // Fixed space issue
    "Sports & Outdoors",
    "Toys & Games",
    "Health & Beauty", // Fixed space issue
    "Automotive",
    "Other",
  ];

  const fetchItems = useCallback(
    async (page: number) => {
      try {
        setIsLoading(true);
        let url = `/api/items?page=${page}&limit=9`;
        // Fix category parameter encoding
        if (category && category !== "all") {
          url += `&category=${encodeURIComponent(category)}`;
        }

        // Add sort parameters
        if (sortBy && sortBy !== "default") {
          switch (sortBy) {
            case "price-low":
              url += "&sort=price";
              break;
            case "price-high":
              url += "&sort=-price";
              break;
            case "rating":
              url += "&sort=-averageRating";
              break;
          }
        }

        const response = await axios.get('/api/items', {
          params: {
            ...(searchTerm && { name: searchTerm }),
            ...(category && { category }),
            page: pagination.currentPage,
            limit: 5
          }
        });
        setItems(response.data.data);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalItems,
        });
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [category, sortBy, searchTerm, pagination.currentPage]
  );

  useEffect(() => {
    fetchItems(1);
  }, [category, sortBy, fetchItems]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
  };

  const handlePageChange = (page: number) => {
    fetchItems(page);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F3]">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <ChatButton apiKey="AIzaSyA37unXfqTDlSOdi84mtNeYoeDHR2yWNQM"/>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-[#2A363B]">Browse Items</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* categories  */}

            <Select onValueChange={setCategory} value={category}>
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

            {/* sorting by */}

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

            {/* filters */}

            {/* <button className="flex items-center gap-2 px-4 py-2 bg-[#2A363B] text-white rounded-full hover:bg-[#435055] transition-colors">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </button> */}
          </div>
        </div>

        {/* Active Filters */}
        {/* <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-3 py-1 bg-[#99B898]/20 text-[#2A363B] rounded-full text-sm flex items-center gap-1">
            Electronics
            <button className="ml-1 hover:text-[#99B898]">×</button>
          </span>
          <span className="px-3 py-1 bg-[#99B898]/20 text-[#2A363B] rounded-full text-sm flex items-center gap-1">
            Under ₹5000
            <button className="ml-1 hover:text-[#99B898]">×</button>
          </span>
        </div> */}

        {/* Product Cards */}

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

        <div className="mt-12">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  className={`hover:bg-[#F8E5D5] ${
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
                    className={
                      pagination.currentPage === i + 1
                        ? "bg-[#99B898] text-white hover:bg-[#7a9479]"
                        : "hover:bg-[#F8E5D5]"
                    }
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  className={`hover:bg-[#F8E5D5] ${
                    pagination.currentPage >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
