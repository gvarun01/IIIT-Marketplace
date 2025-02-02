import React from 'react';
import { ShoppingBag, Tag, Clock, TrendingUp, ChevronRight } from 'lucide-react';

const CategoryCard = ({ icon, title, count }: { icon: React.ReactNode; title: string; count: string }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
    <div className="flex items-center justify-between mb-4">
      <div className="bg-[#FDF8F3] p-3 rounded-lg group-hover:bg-[#99B898] group-hover:text-white transition-all">
        {icon}
      </div>
      <ChevronRight className="text-[#E8B4A2] group-hover:text-[#2A363B] transition-all" />
    </div>
    <h3 className="text-lg font-semibold text-[#2A363B]">{title}</h3>
    <p className="text-[#4A5859]">{count} items</p>
  </div>
);

export const Categories = () => (
  <section className="py-16 bg-[#FDF8F3]">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-[#2A363B] mb-12 text-center">Popular Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <CategoryCard icon={<ShoppingBag />} title="Electronics" count="120+" />
        <CategoryCard icon={<Tag />} title="Books" count="250+" />
        <CategoryCard icon={<Clock />} title="Accessories" count="80+" />
        <CategoryCard icon={<TrendingUp />} title="Study Material" count="150+" />
      </div>
    </div>
  </section>
);