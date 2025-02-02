import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
}

export const ProductGallery = ({ images }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNextImage = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedImage((current) => (current + 1) % images.length);
      setIsTransitioning(false);
    }, 300);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedImage((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handlePrevImage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedImage(
        (current) => (current - 1 + images.length) % images.length
      );
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 group">
        <img
          src={images[selectedImage]}
          alt={`Product image ${selectedImage + 1}`}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isTransitioning ? "opacity-50" : "opacity-100"
          )}
        />

        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePrevImage}
              className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-4 justify-center">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setSelectedImage(index);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={cn(
                "w-16 h-16 rounded-lg overflow-hidden transition-all duration-300",
                selectedImage === index
                  ? "ring-2 ring-[#99B898] scale-105"
                  : "opacity-50 hover:opacity-75"
              )}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};