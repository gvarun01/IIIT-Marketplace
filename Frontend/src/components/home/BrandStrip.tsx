export const BrandStrip = () => {
  const brands = ["VERSACE", "ZARA", "GUCCI", "PRADA", "Calvin Klein"];
  
  return (
    <div className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {brands.map((brand) => (
            <span key={brand} className="text-xl font-semibold text-gray-800">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};