import React from 'react';
import { ShoppingBag, MessageCircle, Shield } from 'lucide-react';

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-8 rounded-xl bg-[#FDF8F3] hover:bg-[#F8E5D5] transition-all">
    <div className="mb-6 text-[#2A363B]">{icon}</div>
    <h3 className="text-xl font-semibold text-[#2A363B] mb-4">{title}</h3>
    <p className="text-[#4A5859]">{description}</p>
  </div>
);

export const Features = () => (
  <section className="py-20 bg-white">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Easy Trading"
          description="List your items in minutes and connect with potential buyers instantly"
        />
        <FeatureCard
          icon={<MessageCircle className="w-8 h-8" />}
          title="Secure Chat"
          description="Built-in messaging system for safe and convenient communication"
        />
        <FeatureCard
          icon={<Shield className="w-8 h-8" />}
          title="Verified Users"
          description="All users are verified IIIT students for maximum security"
        />
      </div>
    </div>
  </section>
);