import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ShoppingBag, Truck, Headset, Search, User, Menu, X, PlusSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import axios from "axios"
import { useDebounce } from "@/hooks/use-debounce"
import { useToast } from "@/components/ui/use-toast"
import type React from "react"

interface SearchResult {
  _id: string
  name: string
  price: number
  images: string[]
}

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState("up")

  useEffect(() => {
    let lastScrollY = window.pageYOffset

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset
      const direction = scrollY > lastScrollY ? "down" : "up"
      if (direction !== scrollDirection && (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)) {
        setScrollDirection(direction)
      }
      lastScrollY = scrollY > 0 ? scrollY : 0
    }

    window.addEventListener("scroll", updateScrollDirection)
    return () => {
      window.removeEventListener("scroll", updateScrollDirection)
    }
  }, [scrollDirection])

  return scrollDirection
}

export const Navbar = ({ isCartAnimating }: { isCartAnimating: boolean }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)
  const scrollDirection = useScrollDirection()
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }

    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showProfileDropdown])

  useEffect(() => {
    const fetchCartItemCount = async () => {
      try {
        const response = await axios.get("/api/cart/count")
        setCartItemCount(response.data.count)
      } catch (error) {
        console.error("Error fetching cart item count:", error)
      }
    }

    fetchCartItemCount()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        })
        navigate("/login")
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <nav
      className={cn(
        "sticky z-50 border-b border-[#E8B4A2]/20 bg-[#FDF8F3] transition-all duration-300",
        scrollDirection === "down" ? "-top-24" : "top-0",
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold">
            <span className="bg-gradient-to-r from-[#2A363B] to-[#435055] bg-clip-text text-transparent">IIIT</span>
            <span className="text-[#2A363B]">Market</span>
          </Link>

          {/* Desktop Menu and Search */}
          <div className="hidden md:flex items-center space-x-6 flex-grow mx-8">
            <NavLink to="/shop" icon={<ShoppingBag className="h-4 w-4" />}>
              Shop
            </NavLink>
            <NavLink to="/delivery" icon={<Truck className="h-4 w-4" />}>
              Delivery
            </NavLink>
            <NavLink to="/add-item" icon={<PlusSquare className="h-4 w-4" />}>
              Sell
            </NavLink>
            <NavLink to="/support" icon={<Headset className="h-4 w-4" />}>
              Support
            </NavLink>
            <div className="flex-grow">
              <SearchBar isVisible={true} onClose={() => {}} />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search toggle for mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[#2A363B] hover:bg-[#F8E5D5]"
              onClick={() => setIsSearchVisible(!isSearchVisible)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <div className="relative">
              <NavIconLink
                to="/cart"
                icon={
                  <div className="relative">
                    <ShoppingBag
                      className={cn(
                        "h-5 w-5 transition-all duration-300 ease-in-out",
                        isCartAnimating && "animate-wiggle text-[#99B898] scale-125",
                      )}
                    />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                }
              />
            </div>

            {/* Profile Icon with Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#2A363B] hover:text-[#99B898] transition-colors duration-200"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <User className="h-5 w-5" />
              </Button>
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F8E5D5] transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F8E5D5] transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-[#2A363B] hover:bg-[#F8E5D5] ml-2">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#FDF8F3] border-l border-[#E8B4A2]/20">
                  <nav className="flex flex-col gap-4 mt-8">
                    <MobileNavLink to="/shop" icon={<ShoppingBag className="h-5 w-5" />}>
                      Shop
                    </MobileNavLink>
                    <MobileNavLink to="/delivery" icon={<Truck className="h-5 w-5" />}>
                      Delivery
                    </MobileNavLink>
                    <MobileNavLink to="/support" icon={<Headset className="h-5 w-5" />}>
                      Support
                    </MobileNavLink>
                    <MobileNavLink to="/profile" icon={<User className="h-5 w-5" />}>
                      Profile
                    </MobileNavLink>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden">
        <SearchBar isVisible={isSearchVisible} onClose={() => setIsSearchVisible(false)} />
      </div>
    </nav>
  )
}

const NavLink = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Link to={to} className="flex items-center gap-2 text-[#2A363B] hover:text-[#99B898] transition-colors duration-200">
    {icon}
    <span className="font-medium">{children}</span>
  </Link>
)

const NavIconLink = ({ to, icon }: { to: string; icon: React.ReactNode }) => (
  <Link to={to} className="p-2 text-[#2A363B] hover:text-[#99B898] transition-colors duration-200">
    {icon}
  </Link>
)

const MobileNavLink = ({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Link
    to={to}
    className="flex items-center gap-3 p-3 text-[#2A363B] hover:bg-[#F8E5D5] rounded-md transition-colors duration-200"
  >
    {icon}
    <span className="font-medium">{children}</span>
  </Link>
)

const SearchBar = ({ isVisible, onClose }: { isVisible: boolean; onClose: () => void }) => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearch = useDebounce(searchTerm, 300)

  useEffect(() => {
    const searchItems = async () => {
      if (debouncedSearch.length < 2) {
        setResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await axios.get(`/api/items?name=${debouncedSearch}&limit=5`)
        setResults(response.data.data)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsSearching(false)
      }
    }

    searchItems()
  }, [debouncedSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      navigate(`/shop?search=${searchTerm}`)
      setSearchTerm("")
      setResults([])
      onClose()
    }
  }

  return (
    <div
      className={cn(
        "absolute inset-x-0 top-full left-0 bg-[#FDF8F3] p-4 md:relative md:inset-auto md:p-0 md:bg-transparent transition-all duration-200 ease-in-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto",
      )}
    >
      <div className="relative flex-1 max-w-full mx-auto md:mx-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#2A363B]/50 h-4 w-4" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products..."
          className="w-full pl-10 pr-10 md:pr-3 py-2 bg-white border border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898] rounded-full text-[#2A363B] placeholder-[#2A363B]/50"
        />

        {/* Search Results Dropdown */}
        {(results.length > 0 || isSearching) && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto border border-[#E8B4A2]/20">
            {isSearching ? (
              <div className="p-4 text-center text-[#2A363B]/50">Searching...</div>
            ) : (
              results.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    navigate(`/product/${item._id}`)
                    setSearchTerm("")
                    setResults([])
                    onClose()
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-[#F8E5D5] cursor-pointer transition-colors duration-200"
                >
                  <img
                    src={item.images[0] || "/placeholder.svg"}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div className="font-medium text-[#2A363B]">{item.name}</div>
                    <div className="text-sm text-[#2A363B]/70">₹{item.price}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {isVisible && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 md:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

