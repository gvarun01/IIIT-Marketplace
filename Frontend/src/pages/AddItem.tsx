import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, X, Check, ArrowUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import axios from "axios";
import Cookies from "js-cookie";

interface CreateItemRequest {
  name: string;
  price: number;
  description: string;
  category: string;
  images: File[];
}

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Health & Beauty",
  "Automotive",
  "Other",
];

interface ItemFormData {
  name: string;
  price: string;
  category: string;
  description: string;
}

const createItem = async (formData: FormData) => {
  const token = Cookies.get("accessToken");
  const response = await axios.post("/api/items", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const AddItem = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>({
    name: "",
    price: "",
    category: "",
    description: "",
  });
  const [dragActive, setDragActive] = useState(false);

  const calculateProgress = () => {
    let progress = 0;
    if (formData.name) progress += 25;
    if (formData.price) progress += 25;
    if (formData.category) progress += 25;
    if (formData.description) progress += 25;
    return progress;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("price", formData.price);
      form.append("description", formData.description);
      form.append("category", formData.category);

      files.forEach((file) => {
        form.append("images", file);
      });

      await createItem(form);

      toast({
        title: "Success",
        description: "Item created successfully",
      });
      navigate("/shop");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [files, setFiles] = useState<File[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const remainingSlots = 5 - files.length;
    const filesToProcess = newFiles.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const imageUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, imageUrl]);
      setFiles((prev) => [...prev, file]);
    });

    if (files.length > remainingSlots) {
      toast({
        title: "Maximum images reached",
        description: `Only ${remainingSlots} image${
          remainingSlots === 1 ? "" : "s"
        } could be added. Maximum limit is 5 images.`,
      });
    } else {
      toast({
        title: "Images uploaded",
        description: `${files.length} image${
          files.length === 1 ? "" : "s"
        } successfully uploaded.`,
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    const remainingSlots = 5 - images.length;
    const filesToProcess = files.slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      const imageUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, imageUrl]);
    });

    if (files.length > remainingSlots) {
      toast({
        title: "Maximum images reached",
        description: `Only ${remainingSlots} image${
          remainingSlots === 1 ? "" : "s"
        } could be added. Maximum limit is 5 images.`,
      });
    } else {
      toast({
        title: "Images uploaded",
        description: `${files.length} image${
          files.length === 1 ? "" : "s"
        } successfully uploaded.`,
      });
    }
  };

  return (
    <>
      <Navbar isCartAnimating={false} />
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#FDF8F3] to-white">
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card className="max-w-3xl mx-auto p-8 bg-white/80 backdrop-blur-sm border border-[#E8B4A2]/20 shadow-lg shadow-[#99B898]/5">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#2A363B] mb-2 bg-gradient-to-r from-[#2A363B] to-[#4A5859] bg-clip-text text-transparent">
                Add New Item
              </h1>
              <p className="text-[#4A5859]/80">
                Fill in the details below to add your item
              </p>
              <Progress
                value={calculateProgress()}
                className="mt-4 h-2 bg-[#E8B4A2]/20"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#2A363B] font-medium">
                    Item Name
                  </Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898] transition-all"
                    placeholder="Enter item name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[#2A363B] font-medium">
                    Price (₹)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898] transition-all"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-[#2A363B] font-medium"
                >
                  Category
                </Label>
                <Select
                  required
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger className="border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898] transition-all">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="hover:bg-[#99B898]/10 cursor-pointer"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-[#2A363B] font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-[120px] border-[#E8B4A2]/20 focus:border-[#99B898] focus:ring-[#99B898] transition-all"
                  placeholder="Describe your item in detail..."
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[#2A363B] font-medium">Images</Label>
                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  onDragEnter={handleDrag}
                >
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <div
                      className={cn(
                        "relative cursor-pointer border-2 border-dashed rounded-lg aspect-square transition-all duration-200",
                        dragActive
                          ? "border-[#99B898] bg-[#99B898]/5"
                          : "border-[#E8B4A2]/40 hover:border-[#99B898]/40 hover:bg-[#99B898]/5"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                        <ImagePlus className="h-8 w-8 text-[#4A5859]" />
                        <span className="text-sm text-[#4A5859] mt-2">
                          {dragActive ? "Drop images here" : "Add Images"}
                        </span>
                        <span className="text-xs text-[#4A5859]/60 mt-1">
                          or click to browse
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-sm text-[#4A5859]/80">
                  Upload up to 5 images (drag and drop supported)
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "flex-1 bg-gradient-to-r from-[#99B898] to-[#7a9479] hover:opacity-90 text-white transition-all duration-200",
                    loading && "animate-pulse"
                  )}
                >
                  {loading ? "Adding Item..." : "Add Item"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/delivery")}
                  className="flex-1 border-[#E8B4A2]/20 text-[#2A363B] hover:bg-[#F8E5D5] transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default AddItem;
