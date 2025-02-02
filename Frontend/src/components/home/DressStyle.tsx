import { Link } from "react-router-dom";

const styles = [
  { name: "Casual", image: "/placeholder.svg" },
  { name: "Formal", image: "/placeholder.svg" },
  { name: "Party", image: "/placeholder.svg" },
  { name: "Gym", image: "/placeholder.svg" },
];

export const DressStyle = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">BROWSE BY DRESS STYLE</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {styles.map((style) => (
            <Link
              key={style.name}
              to={`/style/${style.name.toLowerCase()}`}
              className="relative group"
            >
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={style.image}
                  alt={style.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="text-white text-xl font-medium">
                    {style.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};