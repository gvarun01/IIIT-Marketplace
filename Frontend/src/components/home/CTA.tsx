import React from 'react';
import { ArrowRight } from 'lucide-react';

export const CTA = () => (
  <section className="py-20 bg-[#FDF8F3]">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-[#2A363B] mb-6">
          Ready to Start Trading?
        </h2>
        <p className="text-xl text-[#4A5859] mb-8">
          Join your fellow students in the most trusted campus marketplace
        </p>
        <button className="bg-[#2A363B] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#435055] transition-all flex items-center gap-2 mx-auto">
          Get Started Now
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  </section>
);