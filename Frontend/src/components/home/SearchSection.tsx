import React from 'react';
import { Search } from 'lucide-react';

export const SearchSection = () => (
  <section className="py-12 bg-white">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="What are you looking for?"
            className="w-full px-6 py-4 rounded-full bg-[#FDF8F3] border border-[#E8B4A2] text-[#2A363B] placeholder-[#2A363B]/50 focus:outline-none focus:ring-2 focus:ring-[#99B898] focus:border-transparent"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#2A363B] text-white p-3 rounded-full hover:bg-[#435055] transition-all">
            <Search size={24} />
          </button>
        </div>
      </div>
    </div>
  </section>
);